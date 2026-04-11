import { Worker } from 'bullmq'
import redis from '../../config/redis'
import { ewdifahScraper } from '../ewdifh/ewdifh.scraper'
import logger from '../../shared/utils/logger.util'

export function startScraperWorker(): Worker {

  const worker = new Worker(
    'job-scraper',
    async (job) => {
      logger.info(`[Worker] ▶ Job "${job.name}" started (attempt ${job.attemptsMade + 1})`)
      await ewdifahScraper.run()
    },
    {
      connection: redis,
      concurrency: 1,
    }
  )

  worker.on('completed', (job) =>
    logger.info(`[Worker] ✅ "${job.name}" completed`)
  )

  worker.on('failed', (job, err) =>
    logger.error(`[Worker] ❌ "${job?.name}" failed: ${err.message}`)
  )

  return worker
}