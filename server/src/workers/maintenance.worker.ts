import { Worker, Job } from 'bullmq';
import { maintenanceQueue } from '@/config/bullmq';
import redis from '@/config/redis';
import prismaClient from '@/config/db.config';
import logger from '@/shared/utils/logger.util';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Maintenance Worker
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const maintenanceWorker = new Worker<Record<string, unknown>>(
  maintenanceQueue.name,
  async (job: Job<Record<string, unknown>>) => {
    // 1. Clear Old Activity Logs (Older than 12 hours)
    if (job.name === 'clear-old-activity-logs') {
      logger.info(`🧹 Processing maintenance job ${job.id}: Clearing old activity logs`);

      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

      try {
        const deletedCount = await prismaClient.activityLog.deleteMany({
          where: {
            createdAt: {
              lt: twelveHoursAgo,
            },
          },
        });

        logger.info(
          `✅ Maintenance complete: Deleted ${deletedCount.count} activity log entries older than ${twelveHoursAgo.toISOString()}`
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Maintenance failed for job ${job.id} (Logs): ${errorMessage}`);
        throw error;
      }
    }

    // 2. Clear Old Jobs (Older than 30 days)
    if (job.name === 'clear-old-jobs') {
      logger.info(`🧹 Processing maintenance job ${job.id}: Clearing jobs older than 30 days`);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      try {
        const deletedCount = await prismaClient.job.deleteMany({
          where: {
            createdAt: {
              lt: thirtyDaysAgo,
            },
          },
        });

        logger.info(
          `✅ Maintenance complete: Deleted ${deletedCount.count} jobs older than ${thirtyDaysAgo.toISOString()}`
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Maintenance failed for job ${job.id} (Jobs): ${errorMessage}`);
        throw error;
      }
    }

    if (job.name === 'clear-scraper-logs') {
      logger.info(
        `🧹 Processing maintenance job ${job.id}: Clearing scraper logs older than 12 hours`
      );

      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

      try {
        const deletedCount = await prismaClient.scrapedLog.deleteMany({
          where: {
            createdAt: {
              lt: twelveHoursAgo,
            },
          },
        });

        logger.info(
          `✅ Maintenance complete: Deleted ${deletedCount.count} scraper logs older than ${twelveHoursAgo.toISOString()}`
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Maintenance failed for job ${job.id} (Scraper Logs): ${errorMessage}`);
        throw error;
      }
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Worker Events
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

maintenanceWorker.on('completed', (job) => {
  logger.info(`🎉 Maintenance job ${job.id} (${job.name}) completed successfully`);
});

maintenanceWorker.on('failed', (job, error) => {
  logger.error(`💥 Maintenance job ${job?.id} failed`, { error: error.message });
});

maintenanceWorker.on('error', (error) => {
  logger.error(`💥 Maintenance worker error`, { error: error.message });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Maintenance Scheduler
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function startMaintenanceSchedule() {
  try {
    // Remove existing repeatable jobs to avoid duplicates
    const jobSchedulers = await maintenanceQueue.getJobSchedulers();
    for (const scheduler of jobSchedulers) {
      await maintenanceQueue.removeJobScheduler(scheduler.key);
    }

    // A. Schedule Log Cleanup: Every 12 hours
    await maintenanceQueue.add(
      'clear-old-activity-logs',
      {},
      {
        repeat: {
          pattern: '0 */12 * * *', // Every 12 hours
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    // B. Schedule Job Cleanup: Every Sunday at 01:00 (1 AM)
    await maintenanceQueue.add(
      'clear-old-jobs',
      {},
      {
        repeat: {
          pattern: '0 1 * * 0', // Every Sunday at 1 AM
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    // C. Schedule Scraper Logs Cleanup: Every 12 hours
    await maintenanceQueue.add(
      'clear-scraper-logs',
      {},
      {
        repeat: {
          pattern: '0 */12 * * *', // Every 12 hours
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    logger.info('🗓️ System Maintenance (Logs, Jobs, Scraper Logs Cleanup) scheduled successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to schedule maintenance tasks: ${errorMessage}`);
  }
}

logger.info('✅ System maintenance worker started');
