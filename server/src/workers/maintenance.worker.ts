import { Worker, Job } from 'bullmq';
import { maintenanceQueue } from '@/config/bullmq';
import redis from '@/config/redis';
import prismaClient from '@/config/db.config';
import logger from '@/shared/utils/logger.util';

export const maintenanceWorker = new Worker<Record<string, unknown>>(
  maintenanceQueue.name,
  async (job: Job<Record<string, unknown>>) => {
    if (job.name === 'clear-old-activity-logs') {
      logger.info(`🧹 Processing maintenance job ${job.id}: Clearing old activity logs`);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      try {
        const deletedCount = await prismaClient.activityLog.deleteMany({
          where: {
            createdAt: {
              lt: oneWeekAgo,
            },
          },
        });

        logger.info(
          `✅ Maintenance complete: Deleted ${deletedCount.count} activity log entries older than ${oneWeekAgo.toISOString()}`
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Maintenance failed for job ${job.id}: ${errorMessage}`);
        throw error;
      }
    }
  },
  {
    connection: redis,
    concurrency: 1, // Maintenance is typically a single-concurrency task
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Worker Events
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

maintenanceWorker.on('completed', (job) => {
  logger.info(`🎉 Maintenance job ${job.id} completed successfully`);
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
    const repeatableJobs = await maintenanceQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await maintenanceQueue.removeRepeatableByKey(job.key);
    }

    // Schedule to run every Sunday at 00:00 (Midnight)
    await maintenanceQueue.add(
      'clear-old-activity-logs',
      {},
      {
        repeat: {
          pattern: '0 0 * * 0', // Cron: Every Sunday at midnight
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    logger.info('🗓️ System Maintenance (Weekly Log Cleanup) scheduled successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Failed to schedule maintenance task: ${errorMessage}`);
  }
}

logger.info('✅ System maintenance worker started');
