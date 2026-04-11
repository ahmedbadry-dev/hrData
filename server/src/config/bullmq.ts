import { Queue } from 'bullmq';
import redis from './redis';

export const scraperQueue = new Queue('job-scraper', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 15_000,
    },
    removeOnComplete: 5,
    removeOnFail: 10,
  },
});
