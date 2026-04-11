import { scraperQueue } from '../../config/bullmq'
import logger from '../../shared/utils/logger.util'

export async function registerScraperSchedule(): Promise<void> {

  const existing = await scraperQueue.getRepeatableJobs()
  for (const job of existing) {
    if (job.name === 'daily-ewdifh-scrape') {
      await scraperQueue.removeRepeatableByKey(job.key)
    }
  }

  await scraperQueue.add(
    'daily-ewdifh-scrape',
    {},
    { repeat: { pattern: '0 4 * * *' } }
  )

  await scraperQueue.add('startup-scrape', {})

  logger.info('[Scheduler] ✅ Daily scrape registered at 06:00 Cairo')
}