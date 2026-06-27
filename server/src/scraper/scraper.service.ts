import pLimit from 'p-limit';
import { randomUUID } from 'crypto';
import logger from '@/shared/utils/logger.util';
import redis from '@/config/redis';
import { SITES_CONFIG, DELAY_BETWEEN_SITES_MS, MAX_CONCURRENT_REQUESTS } from './scraper.config';
import type { WebSiteConfig, ApiSourceConfig } from './scraper.types';
import { ScraperClient } from './scraper.client';
import { TwitterClient } from './scraper.twitter';
import { ScraperStorage } from './scraper.storage';
import { SCRAPER_INTERNAL_CONSTANTS } from './scraper.constants';
import { scraperSourceStatusStore } from './scraper-source-status.store';

const limit = pLimit(MAX_CONCURRENT_REQUESTS);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processSingleJob(jobUrl: string, site: WebSiteConfig): Promise<string | null> {
  try {
    const content = await ScraperClient.getJobContent(jobUrl, site);
    if (!content) return null;

    if (content.includes('@')) {
      const extractedList = await ScraperClient.extractWithAI(content, jobUrl, site.name);
      if (extractedList && extractedList.length > 0) {
        for (const extracted of extractedList) {
          const normalized = ScraperStorage.validateAndNormalize(extracted);
          if (normalized) {
            const isDuplicate = await ScraperStorage.isCompanyRecentlyPosted(
              normalized.companyName
            );
            if (isDuplicate) {
              logger.info(
                `[Scraper] ⏭️ Skipping: ${normalized.companyName} already has a post in the last 24h`
              );
              continue;
            }
            await ScraperStorage.saveJobToDb(normalized);
            console.log(
              `[Scraper] ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Saved: ${normalized.title} at ${normalized.companyName} (${normalized.sourceUrl})`
            );
          }
        }
      }
    }

    return content;
  } catch (error) {
    logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.EXCEPTION(jobUrl, error));
    return null;
  }
}

async function processTwitterSource(
  config: ApiSourceConfig
): Promise<{ count: number; urls: { site: string; url: string }[] }> {
  const { valid, error } = await TwitterClient.verifyApiKey(config);
  if (!valid) {
    throw new Error(error ?? 'Twitter API verification failed');
  }

  const { jobs, error: searchError } = await TwitterClient.searchTweets(config);
  if (searchError) {
    throw new Error(searchError);
  }

  if (jobs.length === 0) {
    return { count: 0, urls: [] };
  }

  const urls = jobs.map((job) => ({ site: config.name, url: job.sourceUrl }));

  return { count: jobs.length, urls };
}

export async function runScraperForAllSites(): Promise<void> {
  const isAlreadyRunning = await redis.get(SCRAPER_INTERNAL_CONSTANTS.REDIS_KEYS.IS_RUNNING);
  if (isAlreadyRunning === SCRAPER_INTERNAL_CONSTANTS.REDIS_VALUES.TRUE) {
    logger.warn(SCRAPER_INTERNAL_CONSTANTS.LOGS.ABORT);
    return;
  }

  try {
    await redis.set(
      SCRAPER_INTERNAL_CONSTANTS.REDIS_KEYS.IS_RUNNING,
      SCRAPER_INTERNAL_CONSTANTS.REDIS_VALUES.TRUE,
      SCRAPER_INTERNAL_CONSTANTS.REDIS_MODES.EX,
      SCRAPER_INTERNAL_CONSTANTS.EXPIRY.RUN_LOCK_SECONDS
    );
  } catch (error) {
    logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.LOCK_ERROR(error));
    return;
  }
  logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.START);
  const runId = randomUUID();

  // Clear old logs before starting a new run
  await ScraperStorage.clearScrapedLogs();

  const allLinks: { site: string; url: string }[] = [];
  const scrapedJobs: { site: string; url: string; content: string }[] = [];

  try {
    for (const site of SITES_CONFIG) {
      const siteStartTime = Date.now();
      let linksFound = 0;
      let jobsScraped = 0;

      try {
        await scraperSourceStatusStore.markRunning(site, runId);
        logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.EXPLORING(site.name));

        if (site.type === 'api') {
          const apiSite = site as ApiSourceConfig;
          const { count, urls } = await processTwitterSource(apiSite);
          linksFound = urls.length;
          jobsScraped = count;
          allLinks.push(...urls);
          logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.FINISHED(apiSite.name, urls.length, count));
        } else {
          const webSite = site as WebSiteConfig;
          const jobLinksResult = await ScraperClient.getJobLinksResult(webSite);
          if (!jobLinksResult.ok) {
            throw new Error(jobLinksResult.errorMessage ?? 'Failed to fetch source links');
          }

          const jobLinks = jobLinksResult.links;
          if (jobLinks.length === 0) {
            if (!webSite.allowEmptyLinks) {
              throw new Error(
                `No job links matched selector "${webSite.jobLinkSelector}" for ${webSite.name}. The source markup may have changed.`
              );
            }

            const duration = Date.now() - siteStartTime;
            // Log empty results
            await ScraperStorage.saveScrapedLog({
              siteName: webSite.name,
              linksFound: 0,
              jobsScraped: 0,
              status: 'SUCCESS',
              duration,
            });
            await scraperSourceStatusStore.markSuccess(site, {
              runId,
              linksFound: 0,
              jobsScraped: 0,
              durationMs: duration,
            });
            await sleep(DELAY_BETWEEN_SITES_MS);
            continue;
          }

          const scrapedJobsBefore = scrapedJobs.length;
          linksFound = jobLinks.length;
          allLinks.push(...jobLinks.map((url) => ({ site: webSite.name, url })));

          await Promise.all(
            jobLinks.map((jobUrl) =>
              limit(async () => {
                const content = await processSingleJob(jobUrl, webSite);

                if (
                  content &&
                  scrapedJobs.length <=
                    SCRAPER_INTERNAL_CONSTANTS.LIMITS.MAX_SCRAPED_ITEMS_TO_SAVE &&
                  content.includes('@')
                ) {
                  scrapedJobs.push({ site: webSite.name, url: jobUrl, content });
                }
              })
            )
          );

          jobsScraped = scrapedJobs.length - scrapedJobsBefore;
          logger.info(
            SCRAPER_INTERNAL_CONSTANTS.LOGS.FINISHED(webSite.name, linksFound, jobsScraped)
          );
        }

        // Save Scraped Log to DB
        const duration = Date.now() - siteStartTime;
        await ScraperStorage.saveScrapedLog({
          siteName: site.name,
          linksFound,
          jobsScraped,
          status: 'SUCCESS',
          duration,
        });

        await scraperSourceStatusStore.markSuccess(site, {
          runId,
          linksFound,
          jobsScraped,
          durationMs: duration,
        });

        await sleep(DELAY_BETWEEN_SITES_MS);
      } catch (siteError) {
        logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.SITE_FAILURE(site.name, siteError));
        const errorMessage = siteError instanceof Error ? siteError.message : String(siteError);
        const duration = Date.now() - siteStartTime;

        // Save Failure Log
        await ScraperStorage.saveScrapedLog({
          siteName: site.name,
          linksFound,
          jobsScraped,
          status: 'FAILURE',
          errorMessage,
          duration,
        });

        await scraperSourceStatusStore.markFailure(
          site,
          {
            runId,
            linksFound,
            jobsScraped,
            durationMs: duration,
          },
          errorMessage
        );
        await sleep(DELAY_BETWEEN_SITES_MS);
      }
    }

    logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.SUCCESS);
  } finally {
    await redis.del(SCRAPER_INTERNAL_CONSTANTS.REDIS_KEYS.IS_RUNNING);
    logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.FINISH);
  }
}
