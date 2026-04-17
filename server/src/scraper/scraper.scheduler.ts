// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/scraper/scraper.scheduler.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { scraperQueue } from '@/config/bullmq';
import logger from '@/shared/utils/logger.util';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// startScraperSchedule

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function startScraperSchedule(): Promise<void> {
  await clearScraperSchedule();

  await scraperQueue.upsertJobScheduler(
    'run-scraper-morning',
    {
      pattern: '0 9 * * *',
      tz: 'Asia/Riyadh',
    },
    {
      name: 'run-scraper-morning',
      data: {},
    }
  );

  await scraperQueue.upsertJobScheduler(
    'run-scraper-night',
    {
      pattern: '0 0 * * *',
      tz: 'Asia/Riyadh',
    },
    {
      name: 'run-scraper-night',
      data: {},
    }
  );

  logger.info('[Scraper] 📅 Scheduled: 9AM and 12AM (Riyadh time)');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// clearScraperSchedule

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function clearScraperSchedule(): Promise<void> {
  const repeatableJobs = await scraperQueue.getJobSchedulers();
  for (const job of repeatableJobs) {
    await scraperQueue.removeJobScheduler(job.key);
  }
  logger.info(`[Scraper] 🗑️ Cleared ${repeatableJobs.length} scheduled jobs`);
}
