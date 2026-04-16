import fs from 'fs';
import path from 'path';
import prisma from '@/config/db.config';
import logger from '@/shared/utils/logger.util';
import { ExtractedJob } from './scraper.types';
import { JobLocation } from 'generated/prisma';
import { VALID_LOCATIONS } from './scraper.config';

export class ScraperStorage {
  private static readonly SCRAPED_DATA_DIR = 'scrapedData';
  private static readonly SCRAPED_DIR = 'scraped';

  
  static async saveAllAds(links: { site: string; url: string }[]): Promise<void> {
    await this.saveJson(this.SCRAPED_DATA_DIR, 'allAds.json', links);
  }

  
  static async saveJobDetail(jobs: { site: string; url: string; content: string }[]): Promise<void> {
    await this.saveJson(this.SCRAPED_DIR, 'job.json', jobs);
  }

  
  private static async saveJson(dirName: string, fileName: string, newData: any): Promise<void> {
    try {
      const dirPath = path.join(process.cwd(), dirName);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

      const filePath = path.join(dirPath, fileName);
      let combinedData = newData;


      if (fs.existsSync(filePath)) {
        try {
          const existingContent = fs.readFileSync(filePath, 'utf8');
          const existingData = JSON.parse(existingContent);
          if (Array.isArray(existingData) && Array.isArray(newData)) {
            combinedData = [...existingData, ...newData];
          }
        } catch (parseError) {
          logger.warn(`[Scraper] Could not parse existing ${fileName}, overwriting instead.`);
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(combinedData, null, 2), 'utf8');
      logger.info(
        `[Scraper] JSON Export: Appended to ${fileName}. (Total items: ${
          Array.isArray(combinedData) ? combinedData.length : 1
        })`
      );
    } catch (error: any) {
      logger.error(`[Scraper] Storage Error (${fileName}): ${error.message}`);
    }
  }

  
  static async saveJobToDb(job: ExtractedJob): Promise<void> {
    try {
      await prisma.job.upsert({
        where: {
          title_companyName_location: {
            title: job.title,
            companyName: job.companyName,
            location: job.location as JobLocation,
          },
        },
        update: {
          description: job.description,
          hrEmail: job.hrEmail,
          sourceUrl: job.sourceUrl,
          expiresAt: job.expiresAt ? new Date(job.expiresAt) : null,
        },
        create: {
          title: job.title,
          companyName: job.companyName,
          source: job.source,
          location: job.location as JobLocation,
          category: job.category,
          description: job.description,
          hrEmail: job.hrEmail,
          sourceUrl: job.sourceUrl,
          language: job.language,
          postedAt: job.postedAt ? new Date(job.postedAt) : new Date(),
          expiresAt: job.expiresAt ? new Date(job.expiresAt) : null,
        },
      });

      logger.info(`[Scraper] ✅ Saved to DB: ${job.title} @ ${job.companyName}`);
    } catch (error: any) {
      if (error?.code === 'P2002') return; // Duplicate skipped
      logger.error(`[Scraper] DB Storage Error for ${job.sourceUrl}: ${error?.message}`);
    }
  }

  
  static validateAndNormalize(job: ExtractedJob): ExtractedJob | null {
    if (!job.hrEmail) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(job.hrEmail)) return null;

    const upperLocation = job.location?.toUpperCase();
    const validLocation = (VALID_LOCATIONS as readonly string[]).includes(upperLocation)
      ? upperLocation
      : 'OTHER';

    return {
      ...job,
      title: String(job.title ?? '').slice(0, 500),
      companyName: String(job.companyName ?? '').slice(0, 300),
      location: validLocation,
      category: String(job.category ?? '').slice(0, 200),
      description: String(job.description ?? '').slice(0, 5000),
      source: String(job.source ?? '').slice(0, 200),
      language: job.language === 'en' ? 'en' : 'ar',
    };
  }
}
