import * as fs from 'fs'
import * as path from 'path'
import pLimit from 'p-limit'
import db from '@/config/db.config'
import logger from '@/shared/utils/logger.util'
import { EwdifahListingScraper } from './ewdifh-listing.scraper'
import { EwdifahDetailScraper } from './ewdifh-detail.scraper'
import { jobEnrichmentService } from '../llm/job-enrichment.service'

export class EwdifahScraper {

  private saveLock = Promise.resolve()

  constructor(
    private readonly listingScraper = new EwdifahListingScraper(),
    private readonly detailScraper = new EwdifahDetailScraper(),
    private readonly enrichmentService = jobEnrichmentService
  ) {}

  async run(): Promise<void> {
    logger.info('[EwdifahScraper] ▶ Starting...')

    const listings = await this.listingScraper.scrape()
    const limitedListings = listings.slice(0, 20)
    logger.info(`[EwdifahScraper] Found ${listings.length} listings, processing first ${limitedListings.length}`)

    // Save all listings to scrapedData/allAds.json
    const allAdsDir = path.join(process.cwd(), 'scrapedData')
    if (!fs.existsSync(allAdsDir)) fs.mkdirSync(allAdsDir, { recursive: true })
    fs.writeFileSync(path.join(allAdsDir, 'allAds.json'), JSON.stringify(limitedListings, null, 2))

    const existingUrls = await this.getExistingUrls(limitedListings.map((l) => l.jobUrl))
    const newListings = limitedListings.filter((l) => !existingUrls.has(l.jobUrl))

    logger.info(`[EwdifahScraper] ${newListings.length} new listings to process`)

    if (!newListings.length) {
      logger.info('[EwdifahScraper] ✅ No new listings. Done.')
      return
    }

    const limit = pLimit(3)
    let totalSaved = 0

    await Promise.allSettled(
      newListings.map((listing) =>
        limit(async () => {
          try {

            const bodyText = await this.detailScraper.fetchBodyText(listing.jobUrl)

            if (!bodyText) {
              logger.warn(`[EwdifahScraper] Empty body for ${listing.jobUrl}`)
              return
            }

            // Save raw data to scraped/job.json BEFORE sending to AI
            await this.saveToJobJson([{ ...listing, bodyText }])

            // const { jobs } = await this.enrichmentService.enrich(bodyText, listing.jobUrl)

            // logger.info(
            //   `[EwdifahScraper] LLM extracted ${jobs.length} job(s) from "${listing.title}"`
            // )

            // Save enriched data to scraped/job.json AFTER AI enrichment
            // await this.saveToJobJson(jobs)

            // if (!jobs.length) return

            // const { count } = await db.job.createMany({
            //   data: jobs.map((job: any) => ({
            //     title: job.title,
            //     companyName: job.companyName,
            //     source: 'ewdifh',
            //     sourceUrl: listing.jobUrl,
            //     location: job.location ?? undefined,
            //     category: job.category,
            //     description: job.description,
            //     hrEmail: job.hrEmail,
            //     language: job.language || 'ar',
            //     postedAt: job.postedAt ? new Date(job.postedAt) : null,
            //     expiresAt: job.expiresAt ? new Date(job.expiresAt) : null,
            //   })),
            //   skipDuplicates: true,
            // })

            // totalSaved += count
            // logger.info(
            //   `[EwdifahScraper] ✅ Saved ${count}/${jobs.length} from "${listing.title}"`
            // )
          } catch (err: any) {
            logger.error(
              `[EwdifahScraper] ❌ Failed for ${listing.jobUrl}: ${err.message}`
            )
          }
        })
      )
    )

    logger.info(`[EwdifahScraper] ✅ Done. Total saved: ${totalSaved}`)
  }

  private async getExistingUrls(urls: string[]): Promise<Set<string>> {
    const existing = await db.job.findMany({
      where: { sourceUrl: { in: urls } },
      select: { sourceUrl: true },
    })
    return new Set(existing.map((j: { sourceUrl: string | null }) => j.sourceUrl!))
  }

  private async saveToJobJson(data: any[]) {
    this.saveLock = this.saveLock.then(async () => {
      const jobDir = path.join(process.cwd(), 'scraped')
      if (!fs.existsSync(jobDir)) fs.mkdirSync(jobDir, { recursive: true })
      const jobFile = path.join(jobDir, 'job.json')

      let allEntries: any[] = []
      if (fs.existsSync(jobFile)) {
        try {
          const content = fs.readFileSync(jobFile, 'utf8')
          allEntries = JSON.parse(content)
        } catch (e) {
          allEntries = []
        }
      }
      allEntries.push(...data)
      fs.writeFileSync(jobFile, JSON.stringify(allEntries, null, 2))
    })
    return this.saveLock
  }
}

export const ewdifahScraper = new EwdifahScraper()