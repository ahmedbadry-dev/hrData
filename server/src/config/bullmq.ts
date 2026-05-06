// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/config/bullmq.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Queue } from 'bullmq';
import redis from './redis';
import logger from '../shared/utils/logger.util';

export const scraperQueue = new Queue('job-scraper', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 15_000 },
    removeOnComplete: { count: 5 },
    removeOnFail: { count: 10 },
  },
});

export const jobApplicationsScheduleQueue = new Queue('job-applications-schedule', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10_000 },
    removeOnComplete: { count: 5 },
    removeOnFail: { count: 10 },
  },
});

export const maintenanceQueue = new Queue('system-maintenance', {
  connection: redis,
});

/**
 * Resets all BullMQ queues by obliterating them (removes all jobs, including repeatable ones)
 */
export async function resetAllQueues() {
  const queues = [scraperQueue, jobApplicationsScheduleQueue, maintenanceQueue];

  for (const queue of queues) {
    try {
      await queue.obliterate({ force: true });
      logger.info(`🗑️ Queue obliterated: ${queue.name}`);
    } catch (error) {
      logger.error(`❌ Failed to obliterate queue ${queue.name}:`, error);
    }
  }

  logger.info('✅ All queues have been reset successfully');
}
