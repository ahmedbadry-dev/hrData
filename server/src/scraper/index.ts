import { startScraperWorker } from './worker/scraper.worker'
import { registerScraperSchedule } from './worker/scraper.scheduler'
import logger from '../shared/utils/logger.util'

export async function bootstrapScraper(): Promise<void> {
  try {
    startScraperWorker()
    await registerScraperSchedule()
    logger.info('[Scraper] ✅ Scraper system initialized')
  } catch (err: any) {
    logger.error(`[Scraper] ❌ Failed to initialize: ${err.message}`)

  }
}