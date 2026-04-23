// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/config/bullmq.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Queue } from 'bullmq';
import redis from './redis';

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
