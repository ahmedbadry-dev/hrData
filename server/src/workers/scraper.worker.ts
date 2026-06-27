// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/workers/scraper.worker.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Worker, Job } from 'bullmq';
import redis from '@/config/redis';
import logger from '@/shared/utils/logger.util';
import { runScraperForAllSites } from '@/scraper/scraper.service';
import { scraperQueue } from '@/config/bullmq';
import { scraperSourceStatusStore } from '@/scraper/scraper-source-status.store';

const HEARTBEAT_INTERVAL_MS = 30_000;

const touchHeartbeat = () => {
  void scraperSourceStatusStore.touchWorkerHeartbeat();
};

export const scraperWorker = new Worker(
  scraperQueue.name,

  async (job: Job) => {
    logger.info(`[ScraperWorker] ⚙️ Processing: ${job.name} (id: ${job.id})`);
    await runScraperForAllSites();
  },

  {
    connection: redis,

    concurrency: 1,
  }
);

touchHeartbeat();
const workerHeartbeatTimer = setInterval(touchHeartbeat, HEARTBEAT_INTERVAL_MS);
workerHeartbeatTimer.unref();

scraperWorker.on('completed', (job: Job) => {
  touchHeartbeat();
  logger.info(`[ScraperWorker] ✅ Completed: ${job.name} (id: ${job.id})`);
});

scraperWorker.on('failed', (job: Job | undefined, err: Error) => {
  touchHeartbeat();
  logger.error(`[ScraperWorker] ❌ Failed: ${job?.name} (id: ${job?.id}) — ${err.message}`);
});

scraperWorker.on('error', (err: Error) => {
  touchHeartbeat();
  logger.error(`[ScraperWorker] 🔴 Worker error: ${err.message}`);
});

scraperWorker.on('ready', () => {
  touchHeartbeat();
  logger.info('[ScraperWorker] ✅ Ready and connected to Redis');
});

scraperWorker.on('active', (job: Job) => {
  touchHeartbeat();
  logger.info(`[ScraperWorker] ▶️ Started: ${job.name} (id: ${job.id})`);
});
