import { scraperQueue } from '../../config/bullmq';
import logger from '../../shared/utils/logger.util';

export async function registerScraperSchedule(): Promise<void> {
  const existing = await scraperQueue.getRepeatableJobs();
  for (const job of existing) {
    if (job.name === 'daily-ewdifh-scrape') {
      await scraperQueue.removeRepeatableByKey(job.key);
      logger.info(`[Scheduler] 🗑️ Removed old schedule: ${job.key}`);
    }
  }

  await scraperQueue.add(
    'daily-ewdifh-scrape',
    {},
    {
      repeat: { pattern: '0 4,10,16,22 * * *' },
      attempts: 3,
      backoff: { type: 'exponential', delay: 15_000 },
    }
  );

  await scraperQueue.add('startup-scrape', {});

  logger.info('[Scheduler] ✅ Scraper scheduled 4x/day: 06:00, 12:00, 18:00, 00:00 Cairo');
  logger.info('[Scheduler] ▶ Startup scrape queued immediately');
}
