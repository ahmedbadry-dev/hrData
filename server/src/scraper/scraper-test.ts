import pLimit from 'p-limit';
import logger from '@/shared/utils/logger.util';
import fs from 'fs';
import path from 'path';
import { SITES_CONFIG, DELAY_BETWEEN_SITES_MS, MAX_CONCURRENT_REQUESTS } from './scraper.config';
import { SiteConfig } from './scraper.types';
import { ScraperClient } from './scraper.client';
import { ScraperStorage } from './scraper.storage';
import prisma from '@/config/db.config';

const limit = pLimit(MAX_CONCURRENT_REQUESTS);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let aiProcessCount = 0;
const MAX_AI_LIMIT = 2;

const scrapedJobsForAi: { site: string; url: string; content: string }[] = [];
const aiResponses: any[] = [];

async function processSingleJobTest(jobUrl: string, site: SiteConfig): Promise<string | null> {
  try {
    const content = await ScraperClient.getJobContent(jobUrl, site);
    if (!content) return null;

    if (content.includes('@')) {
      if (aiProcessCount < MAX_AI_LIMIT) {
        aiProcessCount++;
        logger.info(
          `[Scraper Test] 🧠 Sending job ${aiProcessCount}/${MAX_AI_LIMIT} to AI: ${jobUrl}`
        );

        scrapedJobsForAi.push({ site: site.name, url: jobUrl, content });

        try {
          const extractedList = await ScraperClient.extractWithAI(content, jobUrl, site.name);
          if (extractedList && extractedList.length > 0) {
            aiResponses.push({ url: jobUrl, site: site.name, response: extractedList });

            for (const extracted of extractedList) {
              const normalized = ScraperStorage.validateAndNormalize(extracted);
              if (normalized) {
                await ScraperStorage.saveJobToDb(normalized);
                logger.info(
                  `[Scraper Test] ✅ Successfully saved returned job from AI to DB: ${jobUrl} - ${normalized.title}`
                );
              } else {
                logger.warn(
                  `[Scraper Test] ⚠️ Normalization failed or no HR email found for: ${jobUrl} - ${extracted.title}`
                );
              }
            }
          } else {
            logger.warn(`[Scraper Test] ⚠️ AI Extraction returned null or empty for: ${jobUrl}`);
          }
        } catch (error) {
          logger.error(`[Scraper Test] ❌ Error during AI or DB step for ${jobUrl}:`, error);
        }
      }
    }

    return content;
  } catch (error) {
    logger.error(`[Scraper Test] ❌ Error processing job ${jobUrl}`, error);
    return null;
  }
}

export async function runScraperTest(): Promise<void> {
  logger.info('[Scraper Test] 🚀 Starting Scraper Test (Limit 5 AI requests)...');
  aiProcessCount = 0;

  for (const site of SITES_CONFIG) {
    if (aiProcessCount >= MAX_AI_LIMIT) break;
    try {
      logger.info(`[Scraper Test] 🔍 Exploring ${site.name}...`);

      const jobLinks = await ScraperClient.getJobLinks(site);
      if (jobLinks.length === 0) continue;

      logger.info(`[Scraper Test] 📝 Found ${jobLinks.length} links for ${site.name}`);

      await Promise.all(
        jobLinks.map((jobUrl) =>
          limit(async () => {
            if (aiProcessCount >= MAX_AI_LIMIT) return;
            await processSingleJobTest(jobUrl, site);
          })
        )
      );

      await sleep(DELAY_BETWEEN_SITES_MS);
    } catch (siteError) {
      logger.error(`[Scraper Test] ❌ Site ${site.name} failed:`, siteError);
    }
  }

  if (scrapedJobsForAi.length > 0) {
    await ScraperStorage.saveJobDetail(scrapedJobsForAi);
  }

  if (aiResponses.length > 0) {
    const aiResponsesDirPath = path.join(process.cwd(), 'scraped');
    if (!fs.existsSync(aiResponsesDirPath)) fs.mkdirSync(aiResponsesDirPath, { recursive: true });
    fs.writeFileSync(
      path.join(aiResponsesDirPath, 'airesponse.json'),
      JSON.stringify(aiResponses, null, 2),
      'utf8'
    );
    logger.info(
      `[Scraper Test] 💾 Saved AI responses to scraped/airesponse.json (Items: ${aiResponses.length})`
    );
  }

  logger.info('[Scraper Test] ✨ Finished Scraper Test.');
}

runScraperTest()
  .then(async () => {
    logger.info('[Scraper Test] 🔥 Done!');
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('[Scraper Test] 💥 Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
