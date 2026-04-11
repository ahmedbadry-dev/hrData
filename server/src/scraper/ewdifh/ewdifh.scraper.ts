import pLimit from 'p-limit'
import db from '@/config/db.config'
import logger from '@/shared/utils/logger.util'
import { EwdifahListingScraper } from './ewdifh-listing.scraper'
import { EwdifahDetailScraper } from './ewdifh-detail.scraper'
import { jobEnrichmentService } from '../llm/job-enrichment.service'

export class EwdifahScraper {

  constructor(
    private readonly listingScraper = new EwdifahListingScraper(),
    private readonly detailScraper = new EwdifahDetailScraper(),
    private readonly enrichmentService = jobEnrichmentService
  ) {}

  async run(): Promise<void> {
    logger.info('[EwdifahScraper] ▶ Starting...')

    const listings = await this.listingScraper.scrape()
    logger.info(`[EwdifahScraper] Found ${listings.length} listings`)

    const existingUrls = await this.getExistingUrls(listings.map((l) => l.jobUrl))
    const newListings = listings.filter((l) => !existingUrls.has(l.jobUrl))

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

            const { jobs } = await this.enrichmentService.enrich(bodyText, listing.jobUrl)

            logger.info(
              `[EwdifahScraper] LLM extracted ${jobs.length} job(s) from "${listing.title}"`
            )

            if (!jobs.length) return

            const { count } = await db.job.createMany({
              data: jobs.map((job: any) => ({
                title: job.title,
                companyName: job.companyName,
                source: 'ewdifh',
                sourceUrl: listing.jobUrl,
                location: job.location ?? undefined,
                category: job.category,
                description: job.description,
                hrEmail: job.hrEmail,
                language: job.language || 'ar',
                postedAt: job.postedAt ? new Date(job.postedAt) : null,
                expiresAt: job.expiresAt ? new Date(job.expiresAt) : null,
              })),
              skipDuplicates: true,
            })

            totalSaved += count
            logger.info(
              `[EwdifahScraper] ✅ Saved ${count}/${jobs.length} from "${listing.title}"`
            )
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
}

export const ewdifahScraper = new EwdifahScraper()