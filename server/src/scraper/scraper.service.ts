import pLimit from 'p-limit';
import logger from '@/shared/utils/logger.util';
import redis from '@/config/redis';
import { SITES_CONFIG, DELAY_BETWEEN_SITES_MS, MAX_CONCURRENT_REQUESTS } from './scraper.config';
import { SiteConfig } from './scraper.types';
import { ScraperClient } from './scraper.client';
import { ScraperStorage } from './scraper.storage';

const limit = pLimit(MAX_CONCURRENT_REQUESTS);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function processSingleJob(jobUrl: string, site: SiteConfig): Promise<string | null> {
  try {
    const content = await ScraperClient.getJobContent(jobUrl, site);
    if (!content) return null;

    // ─────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────
    // const jobData = await ScraperClient.extractWithAI(content, jobUrl, site.name);
    // if (!jobData) return content;

    // const validatedJob = ScraperStorage.validateAndNormalize(jobData);
    // if (!validatedJob) return content;

    // await ScraperStorage.saveJobToDb(validatedJob);
    // ─────────────────────────────────────────────────────────────

    return content;
  } catch (error) {
    logger.error(`[Scraper] Exception processing ${jobUrl}: ${error}`);
    return null;
  }
}

export async function runScraperForAllSites(): Promise<void> {
  const isAlreadyRunning = await redis.get('scraper:is-running');
  if (isAlreadyRunning === 'true') {
    logger.warn('[Scraper][Abort] Already running.');
    return;
  }

  await redis.set('scraper:is-running', 'true', 'EX', 3600);
  logger.info('[Scraper][Start] 🚀 Running full cycle...');

  const allLinks: { site: string; url: string }[] = [];
  const scrapedJobs: { site: string; url: string; content: string }[] = [];

  try {
    for (const site of SITES_CONFIG) {
      try {
        logger.info(`[Scraper] 📡 Exploring site: ${site.name}`);

        const jobLinks = await ScraperClient.getJobLinks(site);
        if (jobLinks.length === 0) continue;

        allLinks.push(...jobLinks.map((url) => ({ site: site.name, url })));

        await Promise.all(
          jobLinks.map((jobUrl) =>
            limit(async () => {
              const content = await processSingleJob(jobUrl, site);

              if (content && scrapedJobs.length < 20) {
                scrapedJobs.push({ site: site.name, url: jobUrl, content });
              }
            })
          )
        );

        logger.info(`[Scraper] ✅ Finished: ${site.name}`);
        await sleep(DELAY_BETWEEN_SITES_MS);
      } catch (siteError) {
        logger.error(`[Scraper] Site Failure (${site.name}): ${siteError}`);
      }
    }

    if (allLinks.length > 0) {
      await ScraperStorage.saveAllAds(allLinks.slice(0, 20));
    }
    if (scrapedJobs.length > 0) {
      await ScraperStorage.saveJobDetail(scrapedJobs.slice(0, 20));
    }

    logger.info('[Scraper][Success] 🎉 All tasks completed.');
  } finally {
    await redis.del('scraper:is-running');
    logger.info('[Scraper][Finish] 🏁 Lock cleared.');
  }
}
