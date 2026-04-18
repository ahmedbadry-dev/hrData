import pLimit from 'p-limit';
import logger from '@/shared/utils/logger.util';
import redis from '@/config/redis';
import { SITES_CONFIG, DELAY_BETWEEN_SITES_MS, MAX_CONCURRENT_REQUESTS } from './scraper.config';
import { SiteConfig } from './scraper.types';
import { ScraperClient } from './scraper.client';
import { ScraperStorage } from './scraper.storage';
import { SCRAPER_INTERNAL_CONSTANTS } from './scraper.constants';

const limit = pLimit(MAX_CONCURRENT_REQUESTS);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processSingleJob(jobUrl: string, site: SiteConfig): Promise<string | null> {
  try {
    const content = await ScraperClient.getJobContent(jobUrl, site);
    if (!content) return null;

    if (content.includes('@')) {
      // const extractedList = await ScraperClient.extractWithAI(content, jobUrl, site.name);
      // if (extractedList && extractedList.length > 0) {
      //   for (const extracted of extractedList) {
      //     const normalized = ScraperStorage.validateAndNormalize(extracted);
      //     if (normalized) {
      //       await ScraperStorage.saveJobToDb(normalized);
      //     }
      //   }
      // }
    }

    return content;
  } catch (error) {
    logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.EXCEPTION(jobUrl, error));
    return null;
  }
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
      SCRAPER_INTERNAL_CONSTANTS.EXPIRY.LOCK_ONE_HOUR
    );
  } catch (error) {
    logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.LOCK_ERROR(error));
    return;
  }
  logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.START);

  const allLinks: { site: string; url: string }[] = [];
  const scrapedJobs: { site: string; url: string; content: string }[] = [];

  try {
    for (const site of SITES_CONFIG) {
      try {
        logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.EXPLORING(site.name));

        const jobLinks = await ScraperClient.getJobLinks(site);
        if (jobLinks.length === 0) continue;
        const allLinksCount = allLinks.length;
        const scrapedJobsCount = scrapedJobs.length;
        allLinks.push(...jobLinks.map((url) => ({ site: site.name, url })));

        await Promise.all(
          jobLinks.map((jobUrl) =>
            limit(async () => {
              const content = await processSingleJob(jobUrl, site);

              if (
                content &&
                scrapedJobs.length <= SCRAPER_INTERNAL_CONSTANTS.LIMITS.MAX_SCRAPED_ITEMS_TO_SAVE &&
                content.includes('@')
              ) {
                scrapedJobs.push({ site: site.name, url: jobUrl, content });
              }
            })
          )
        );

        logger.info(
          SCRAPER_INTERNAL_CONSTANTS.LOGS.FINISHED(
            site.name,
            allLinks.length - allLinksCount,
            scrapedJobs.length - scrapedJobsCount
          )
        );
        await sleep(DELAY_BETWEEN_SITES_MS);
      } catch (siteError) {
        logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.SITE_FAILURE(site.name, siteError));
      }
    }

    if (allLinks.length > 0) {
      await ScraperStorage.saveAllAds(
        allLinks.slice(0, SCRAPER_INTERNAL_CONSTANTS.LIMITS.MAX_SCRAPED_ITEMS_TO_SAVE)
      );
    }
    if (scrapedJobs.length > 0) {
      await ScraperStorage.saveJobDetail(
        scrapedJobs.slice(0, SCRAPER_INTERNAL_CONSTANTS.LIMITS.MAX_SCRAPED_ITEMS_TO_SAVE)
      );
    }

    logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.SUCCESS);
  } finally {
    await redis.del(SCRAPER_INTERNAL_CONSTANTS.REDIS_KEYS.IS_RUNNING);
    logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.FINISH);
  }
}
