in server/src/scraper/scraper.client.ts

```ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import Bottleneck from 'bottleneck';
import logger from '@/shared/utils/logger.util';
import { geminiClient } from '@/config/llm';
import { AI_REQUESTS_PER_MINUTE, JOB_RESPONSE_SCHEMA, MAX_CONTENT_CHARS } from './scraper.config';
import { SiteConfig, ExtractedJob } from './scraper.types';

export class ScraperClient {
  private static readonly httpClient = axios.create({
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        'Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ar,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  private static readonly aiLimiter = new Bottleneck({
    minTime: 60000 / AI_REQUESTS_PER_MINUTE,
    maxConcurrent: 1,
  });
  static async fetchHtml(url: string, retries = 3): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data } = await this.httpClient.get<string>(url);
        return data;
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 404 || status === 403) return null;
        if (status === 429) {
          await new Promise((r) => setTimeout(r, 10000));
          continue;
        }
        if (attempt === retries) return null;
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
    return null;
  }

  static async getJobLinks(site: SiteConfig): Promise<string[]> {
    let html: string | null;

    if (site.ajaxConfig) {
      try {
        const { data } = await this.httpClient.post(
          site.ajaxConfig.endpoint,
          new URLSearchParams(site.ajaxConfig.params),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Requested-With': 'XMLHttpRequest',
              Referer: site.url,
            },
          }
        );
        html = data?.html ?? null;
      } catch (error) {
        logger.error(`[Scraper] AJAX fetch failed for ${site.name}: ${error}`);
        return [];
      }
    } else {
      html = await this.fetchHtml(site.url);
    }

    if (!html) return [];

    const $ = cheerio.load(html);
    const links: string[] = [];
    $(site.jobLinkSelector).each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const fullUrl = href.startsWith('http') ? href : `${site.baseUrl}${href}`;
      if (!links.includes(fullUrl)) links.push(fullUrl);
    });
    return links;
  }

  static async getJobContent(jobUrl: string, site: SiteConfig): Promise<string | null> {
    const html = await this.fetchHtml(jobUrl);
    if (!html) return null;

    const $ = cheerio.load(html);
    const contentDiv = $(site.jobContentSelector).clone();
    if (!contentDiv.length) return null;

    // Remove code blocks and advertisements from the extracted content
    contentDiv.find('script, style, .niymeqpos, .adsbygoogle, .betterads, iframe').remove();

    return contentDiv.text().replace(/\s+/g, ' ').trim().slice(0, MAX_CONTENT_CHARS);
  }

  static async extractWithAI(
    content: string,
    sourceUrl: string,
    siteName: string
  ): Promise<ExtractedJob[] | null> {
    if (!geminiClient) return null;

    try {
      const response = await this.aiLimiter.schedule(() =>
        geminiClient.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `استخرج جميع بيانات الوظائف من النص التالي في صيغة مصفوفة JSON (Array of Objects). إذا كان النص يحتوي على أكثر من مسمى وظيفي أو وظيفة، قم بتقسيمهم وإرجاع كل وظيفة ككائن منفصل في المصفوفة. وإذا كانت وظيفة واحدة، أرجعها أيضاً داخل المصفوفة:\n\n${content}`,
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: JOB_RESPONSE_SCHEMA,
            thinkingConfig: { thinkingBudget: 0 },
          },
        })
      );

      const responseText = response.text;
      if (!responseText) return null;

      const parsed: ExtractedJob[] = JSON.parse(responseText);

      const jobsArray = Array.isArray(parsed) ? parsed : [parsed];

      return jobsArray.map((job) => {
        job.source = siteName;
        job.sourceUrl = sourceUrl;
        return job;
      });
    } catch (error: any) {
      logger.error(`[Scraper] AI Error: ${error?.message}`);
      return null;
    }
  }
}
```

in server/src/scraper/scraper.storage.ts

```ts
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

  static async saveJobDetail(
    jobs: { site: string; url: string; content: string }[]
  ): Promise<void> {
    await this.saveJson(this.SCRAPED_DIR, 'job.json', jobs);
  }

  private static async saveJson(dirName: string, fileName: string, newData: any): Promise<void> {
    try {
      const dirPath = path.join(process.cwd(), dirName);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

      const filePath = path.join(dirPath, fileName);

      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf8');
      logger.info(
        `[Scraper] JSON Export: Saved to ${fileName}. (Items: ${
          Array.isArray(newData) ? newData.length : 1
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
```

in server/src/scraper/scraper.config.ts

```ts
import { SiteConfig } from './scraper.types';

export const SITES_CONFIG: SiteConfig[] = [
  {
    name: 'ewdifh',
    url: 'https://www.ewdifh.com/category/corporate-jobs',
    baseUrl: 'https://www.ewdifh.com',
    jobLinkSelector: 'div.grid a[href*="/jobs/"]',
    jobContentSelector: 'div.card-body',
  },
  {
    name: 'wadifh',
    url: 'https://www.jobs-1.com/jobs/archive/8', // صفحة الوظائف الشركات
    baseUrl: 'https://www.jobs-1.com',

    jobLinkSelector: 'div.bl-news-item a[href*="www.jobs-1.com/1"]',

    jobContentSelector: 'div.bl-detail-page',
  },
  {
    name: 'linkedksa',
    url: 'https://linkedksa.com',
    baseUrl: 'https://linkedksa.com',
    jobLinkSelector: 'div.uc_post_list_box a[href*="linkedksa.com/"]',
    jobContentSelector: '.elementor-widget-theme-post-content .elementor-widget-container',
  },
  {
    name: 'tabiwazifa',
    url: 'https://wazaef.net/jobs/category/%D9%88%D8%B8%D8%A7%D8%A6%D9%81-%D8%B4%D8%B1%D9%83%D8%A7%D8%AA',
    baseUrl: 'https://wazaef.net',
    jobLinkSelector:
      '.entry-list-item .entry-content-wrap .entry-header .entry-title a[href*="wazaef.net/jobs"]',
    jobContentSelector: '.elementor-widget-container',
  },
  {
    name: 'jbscv',
    url: 'https://jbscv.com/jobs',
    baseUrl: 'https://jbscv.com',
    jobLinkSelector: 'li.job_listing a[href*="/jobs/"]',
    jobContentSelector: 'div.job_description, div.application_details',
    ajaxConfig: {
      endpoint: 'https://jbscv.com/jm-ajax/get_listings/',
      params: {
        action: 'get_listings',
        lang: '',
        per_page: '50',
        orderby: 'desc',
        order: 'DESC',
        page: '1',
        show_pagination: 'false',
        post_id: '25709',
        'filter_job_type[]': 'remote',
        search_keywords: '',
        search_location: '',
        search_region: '0',
      },
    },
  },
  {
    name: 'fu1sa',
    url: 'https://fu1sa.com/jobs/category/%D9%88%D8%B8%D8%A7%D8%A6%D9%81-%D8%B4%D8%B1%D9%83%D8%A7%D8%AA/',
    baseUrl: 'https://fu1sa.com',
    jobLinkSelector: '.entry-title a',
    jobContentSelector: '.entry-content .card-body',
  },
  {
    name: 'alwzifa',
    url: 'https://alwzifa.com',
    baseUrl: 'https://alwzifa.com',
    jobLinkSelector: '.post-title',
    jobContentSelector: '.single-container article .entry-content',
  },
  {
    name: 'jobhuna',
    url: 'https://jobhuna.com',
    baseUrl: 'https://jobhuna.com',
    jobLinkSelector: '.entry-title a',
    jobContentSelector: '.entry-content',
  },
  {
    name: 'awamirtawzif',
    url: 'https://www.awamirtawzif.com/jobs',
    baseUrl: 'https://www.awamirtawzif.com',
    jobLinkSelector: 'article h3 a',
    jobContentSelector: '.content-container',
  },
];

export const VALID_LOCATIONS = [
  'RIYADH',
  'JEDDAH',
  'DAMMAM',
  'KHOBAR',
  'MECCA',
  'MEDINA',
  'TABUK',
  'OTHER',
] as const;

export const JOB_RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: 'عنوان الوظيفة', nullable: false },
      companyName: { type: 'STRING', description: 'اسم الشركة', nullable: false },
      location: {
        type: 'STRING',
        description:
          'المدينة بالإنجليزي كابيتال: RIYADH أو JEDDAH أو DAMMAM أو KHOBAR أو MECCA أو MEDINA أو TABUK',
        nullable: false,
      },
      category: {
        type: 'STRING',
        description: 'تصنيف الوظيفة مثل: هندسة البرمجيات، المحاسبة، التسويق',
        nullable: false,
      },
      description: { type: 'STRING', description: 'وصف مختصر للوظيفة في 2-3 جمل', nullable: false },
      hrEmail: {
        type: 'STRING',
        description: 'البريد الإلكتروني للتقديم أو التواصل — null لو مش موجود في النص',
        nullable: true,
      },
      language: { type: 'STRING', description: 'لغة الإعلان: ar أو en', nullable: false },
      postedAt: {
        type: 'STRING',
        description: 'تاريخ نشر الإعلان بصيغة ISO 8601 — null لو مش موجود',
        nullable: true,
      },
      expiresAt: {
        type: 'STRING',
        description: 'تاريخ انتهاء الإعلان بصيغة ISO 8601 — null لو مش موجود',
        nullable: true,
      },
    },
    required: ['title', 'companyName', 'location', 'category', 'description', 'language'],
  },
};

export const DELAY_BETWEEN_SITES_MS = 2000;

export const MAX_CONCURRENT_REQUESTS = 5;

export const MAX_CONTENT_CHARS = 6000;

export const AI_REQUESTS_PER_MINUTE = 4;
```

in server/src/scraper/scraper.types.ts

```ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/scraper/scraper.types.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SiteConfig {
  name: string;
  url: string;
  jobLinkSelector: string;
  jobContentSelector: string;
  baseUrl: string;
  ajaxConfig?: {
    endpoint: string;
    params: Record<string, string>;
  };
}

export interface ExtractedJob {
  title: string;
  companyName: string;
  source: string;
  location: string;
  category: string;
  description: string;
  hrEmail: string | null;
  sourceUrl: string;
  language: string;
  postedAt: string | null;
  expiresAt: string | null;
}
```
in src/scraper/scraper.service.ts

```ts
import pLimit from 'p-limit';
import logger from '@/shared/utils/logger.util';
import redis from '@/config/redis';
import { SITES_CONFIG, DELAY_BETWEEN_SITES_MS, MAX_CONCURRENT_REQUESTS } from './scraper.config';
import { SiteConfig } from './scraper.types';
import { ScraperClient } from './scraper.client';
import { ScraperStorage } from './scraper.storage';
import { SCRAPER_INTERNAL_CONSTANTS } from './scraper.constants';

const limit = pLimit(MAX_CONCURRENT_REQUESTS);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processSingleJob(jobUrl: string, site: SiteConfig): Promise<string | null> {
  try {
    const content = await ScraperClient.getJobContent(jobUrl, site);
    if (!content) return null;

    if (content.includes('@')) {
      // const extractedList = await ScraperClient.extractWithAI(content, jobUrl, site.name);
      // if (extractedList && extractedList.length > 0) {
      //   for (const extracted of extractedList) {
      //     const normalized = ScraperStorage.validateAndNormalize(extracted);
      //     if (normalized) {
      //       await ScraperStorage.saveJobToDb(normalized);
      //     }
      //   }
      // }
    }

    return content;
  } catch (error) {
    logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.EXCEPTION(jobUrl, error));
    return null;
  }
}

export async function runScraperForAllSites(): Promise<void> {
  const isAlreadyRunning = await redis.get(SCRAPER_INTERNAL_CONSTANTS.REDIS_KEYS.IS_RUNNING);
  if (isAlreadyRunning === SCRAPER_INTERNAL_CONSTANTS.REDIS_VALUES.TRUE) {
    logger.warn(SCRAPER_INTERNAL_CONSTANTS.LOGS.ABORT);
    return;
  }

  try {
    await redis.set(
      SCRAPER_INTERNAL_CONSTANTS.REDIS_KEYS.IS_RUNNING,
      SCRAPER_INTERNAL_CONSTANTS.REDIS_VALUES.TRUE,
      SCRAPER_INTERNAL_CONSTANTS.REDIS_MODES.EX,
      SCRAPER_INTERNAL_CONSTANTS.EXPIRY.LOCK_ONE_HOUR
    );
  } catch (error) {
    logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.LOCK_ERROR(error));
    return;
  }
  logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.START);

  const allLinks: { site: string; url: string }[] = [];
  const scrapedJobs: { site: string; url: string; content: string }[] = [];

  try {
    for (const site of SITES_CONFIG) {
      try {
        logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.EXPLORING(site.name));

        const jobLinks = await ScraperClient.getJobLinks(site);
        if (jobLinks.length === 0) continue;
        const allLinksCount = allLinks.length;
        const scrapedJobsCount = scrapedJobs.length;
        allLinks.push(...jobLinks.map((url) => ({ site: site.name, url })));

        await Promise.all(
          jobLinks.map((jobUrl) =>
            limit(async () => {
              const content = await processSingleJob(jobUrl, site);

              if (
                content &&
                scrapedJobs.length <= SCRAPER_INTERNAL_CONSTANTS.LIMITS.MAX_SCRAPED_ITEMS_TO_SAVE &&
                content.includes('@')
              ) {
                scrapedJobs.push({ site: site.name, url: jobUrl, content });
              }
            })
          )
        );

        logger.info(
          SCRAPER_INTERNAL_CONSTANTS.LOGS.FINISHED(
            site.name,
            allLinks.length - allLinksCount,
            scrapedJobs.length - scrapedJobsCount
          )
        );
        await sleep(DELAY_BETWEEN_SITES_MS);
      } catch (siteError) {
        logger.error(SCRAPER_INTERNAL_CONSTANTS.LOGS.SITE_FAILURE(site.name, siteError));
      }
    }

    if (allLinks.length > 0) {
      await ScraperStorage.saveAllAds(
        allLinks.slice(0, SCRAPER_INTERNAL_CONSTANTS.LIMITS.MAX_SCRAPED_ITEMS_TO_SAVE)
      );
    }
    if (scrapedJobs.length > 0) {
      await ScraperStorage.saveJobDetail(
        scrapedJobs.slice(0, SCRAPER_INTERNAL_CONSTANTS.LIMITS.MAX_SCRAPED_ITEMS_TO_SAVE)
      );
    }

    logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.SUCCESS);
  } finally {
    await redis.del(SCRAPER_INTERNAL_CONSTANTS.REDIS_KEYS.IS_RUNNING);
    logger.info(SCRAPER_INTERNAL_CONSTANTS.LOGS.FINISH);
  }
}
```

in server/src/scraper/scraper.constants

```ts 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/scraper/scraper.constants.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SCRAPER_INTERNAL_CONSTANTS = {
  REDIS_KEYS: {
    IS_RUNNING: 'scraper:is-running',
  },
  REDIS_VALUES: {
    TRUE: 'true',
  },
  EXPIRY: {
    LOCK_ONE_HOUR: 3600,
  },
  REDIS_MODES: {
    EX: 'EX',
  },
  LIMITS: {
    MAX_SCRAPED_ITEMS_TO_SAVE: 200,
  },
  LOGS: {
    PREFIX: '[Scraper]',
    ABORT: '[Scraper][Abort] Already running.',
    START: '[Scraper][Start] 🚀 Running full cycle...',
    SUCCESS: '[Scraper][Success] 🎉 All tasks completed.',
    FINISH: '[Scraper][Finish] 🏁 Lock cleared.',
    EXPLORING: (name: string) => `[Scraper] 📡 Exploring site: ${name}`,
    FINISHED: (name: string, newLinks: number, newScrapedJobs: number) =>
      `[Scraper] ✅ Finished: ${name} and saved ${newLinks} new links and ${newScrapedJobs} new scraped jobs`,
    SITE_FAILURE: (name: string, error: any) => `[Scraper] Site Failure (${name}): ${error}`,
    EXCEPTION: (url: string, error: any) => `[Scraper] Exception processing ${url}: ${error}`,
    LOCK_ERROR: (error: any) => `[Scraper] Critical Redis error while handling lock: ${error}`,
  },
} as const;

```

in src/scraper/scraper.schedule.ts

```ts 
import { scraperQueue } from '@/config/bullmq';
import logger from '@/shared/utils/logger.util';

export async function startScraperSchedule(): Promise<void> {
  await clearScraperSchedule();

  await scraperQueue.upsertJobScheduler(
    'run-scraper-morning',
    {
      pattern: '0 9 * * *',
      tz: 'Asia/Riyadh',
    },
    {
      name: 'run-scraper-morning',
      data: {},
    }
  );

  await scraperQueue.upsertJobScheduler(
    'run-scraper-night',
    {
      pattern: '0 0 * * *',
      tz: 'Asia/Riyadh',
    },
    {
      name: 'run-scraper-night',
      data: {},
    }
  );

  logger.info('[Scraper] 📅 Scheduled: 9AM and 12AM (Riyadh time)');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// clearScraperSchedule

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function clearScraperSchedule(): Promise<void> {
  const repeatableJobs = await scraperQueue.getJobSchedulers();
  for (const job of repeatableJobs) {
    await scraperQueue.removeJobScheduler(job.key);
  }
  logger.info(`[Scraper] 🗑️ Cleared ${repeatableJobs.length} scheduled jobs`);
}

```

in server/src/v1/scraper/scraper.controller.ts

```ts 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/v1/modules/scraper/scraper.controller.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Request, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { ScraperService } from './scraper.service';
import { SCRAPER_CONSTANTS } from './scraper.constants';

export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // GET /api/v1/admin/scraper/status
  getStatus = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.scraperService.getStatus();
    return ResponseHelper.ok(res, data, SCRAPER_CONSTANTS.MESSAGES.STATUS_FETCHED, req.path);
  };

  // POST /api/v1/admin/scraper/start
  start = async (req: Request, res: Response): Promise<Response> => {
    await this.scraperService.start();
    return ResponseHelper.ok(res, {}, SCRAPER_CONSTANTS.MESSAGES.STARTED, req.path);
  };

  // POST /api/v1/admin/scraper/stop
  stop = async (req: Request, res: Response): Promise<Response> => {
    await this.scraperService.stop();
    return ResponseHelper.ok(res, {}, SCRAPER_CONSTANTS.MESSAGES.STOPPED, req.path);
  };

  // POST /api/v1/admin/scraper/run-now
  runNow = async (req: Request, res: Response): Promise<Response> => {
    await this.scraperService.runNow();
    return ResponseHelper.ok(res, {}, SCRAPER_CONSTANTS.MESSAGES.MANUAL_RUN_QUEUED, req.path);
  };
}

```

in server/src/v1/scraper/scraper.routes.ts

```ts 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/v1/modules/scraper/scraper.routes.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Router } from 'express';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '@/http/middlewares/auth.middleware';
import { UserRole } from 'generated/prisma';
import { ScraperController } from './scraper.controller';

export const scraperRoutes = (scraperController: ScraperController): Router => {
  const router = Router();

  const adminOnly = [authenticationMiddleware, authorizationMiddleware(UserRole.ADMIN)];

  // GET  /api/v1/admin/scraper/status
  router.get('/status', ...adminOnly, scraperController.getStatus);

  // POST /api/v1/admin/scraper/start
  router.post('/start', ...adminOnly, scraperController.start);

  // POST /api/v1/admin/scraper/stop
  router.post('/stop', ...adminOnly, scraperController.stop);

  // POST /api/v1/admin/scraper/run-now
  router.post('/run-now', ...adminOnly, scraperController.runNow);

  return router;
};

```


in server/src/v1/scraper/scraper.service.ts

```ts 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/v1/modules/scraper/scraper.service.ts

// (start / stop / status / run-now)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { ConflictException } from '@/shared/errors/ConflictException';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import redis from '@/config/redis';
import { scraperQueue } from '@/config/bullmq';
import { startScraperSchedule, clearScraperSchedule } from '@/scraper/scraper.scheduler';
import { SCRAPER_CONSTANTS } from './scraper.constants';

export interface ScraperStatusResponse {
  status: string;
  isCurrentlyRunning: boolean;
  scheduledJobs: number;
  queue: {
    waiting: number;
    active: number;
    failed: number;
  };
}

export class ScraperService {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async getStatus(): Promise<ScraperStatusResponse> {
    const [status, isRunning, repeatableJobs, waiting, active, failed] = await Promise.all([
      redis.get('scraper:status'), // running | paused | stopped
      redis.get('scraper:is-running'),
      scraperQueue.getJobSchedulers(),
      scraperQueue.getWaitingCount(),
      scraperQueue.getActiveCount(),
      scraperQueue.getFailedCount(),
    ]);

    return {
      status: status ?? 'stopped',
      isCurrentlyRunning: isRunning === 'true',
      scheduledJobs: repeatableJobs.length,
      queue: { waiting, active, failed },
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async start(): Promise<void> {
    const currentStatus = await redis.get('scraper:status');

    if (currentStatus === 'running') {
      throw new ConflictException(SCRAPER_CONSTANTS.MESSAGES.ALREADY_RUNNING);
    }

    await startScraperSchedule();

    await redis.set('scraper:status', 'running');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async stop(): Promise<void> {
    const currentStatus = await redis.get('scraper:status');

    if (currentStatus !== 'running') {
      throw new BadRequestException(SCRAPER_CONSTANTS.MESSAGES.NOT_RUNNING);
    }

    await clearScraperSchedule();
    await redis.set('scraper:status', 'paused');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async runNow(): Promise<void> {
    await scraperQueue.add('run-scraper-manual', {}, { priority: 1 });
  }
}

```

in server/src/v1/scraper/scraper.constatns.ts

```ts 

export const SCRAPER_CONSTANTS = {
  MESSAGES: {
    STATUS_FETCHED: 'Scraper status fetched successfully',
    ALREADY_RUNNING: 'Scraper is already running',
    NOT_RUNNING: 'Scraper is not currently running',
    STARTED: 'Scraper started. Runs at 9AM and 9PM Riyadh time.',
    STOPPED: 'Scraper stopped. Current batch will finish normally.',
    MANUAL_RUN_QUEUED: 'Scraper job queued for immediate execution',
  },
} as const;

```

in server/src/workers/scraper.worker.ts

```ts 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/workers/scraper.worker.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Worker, Job } from 'bullmq';
import redis from '@/config/redis';
import logger from '@/shared/utils/logger.util';
import { runScraperForAllSites } from '@/scraper/scraper.service';

export const scraperWorker = new Worker(
  'job-scraper',

  async (job: Job) => {
    logger.info(`[ScraperWorker] ⚙️ Processing: ${job.name} (id: ${job.id})`);
    await runScraperForAllSites();
  },

  {
    connection: redis,

    concurrency: 1,
  }
);

scraperWorker.on('completed', (job: Job) => {
  logger.info(`[ScraperWorker] ✅ Completed: ${job.name} (id: ${job.id})`);
});

scraperWorker.on('failed', (job: Job | undefined, err: Error) => {
  logger.error(`[ScraperWorker] ❌ Failed: ${job?.name} (id: ${job?.id}) — ${err.message}`);
});

scraperWorker.on('error', (err: Error) => {
  logger.error(`[ScraperWorker] 🔴 Worker error: ${err.message}`);
});

scraperWorker.on('ready', () => {
  logger.info('[ScraperWorker] ✅ Ready and connected to Redis');
});

scraperWorker.on('active', (job: Job) => {
  logger.info(`[ScraperWorker] ▶️ Started: ${job.name} (id: ${job.id})`);
});
```

in server/src/config/bullmq.ts
```ts
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
```

in server/src/config/bull-board.ts
```ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { scraperQueue, jobApplicationsScheduleQueue } from './bullmq';

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath('/admin/queues');

const bullBoard = createBullBoard({
  queues: [new BullMQAdapter(scraperQueue), new BullMQAdapter(jobApplicationsScheduleQueue)],
  serverAdapter,
});

export const bullBoardRouter = serverAdapter.getRouter();

```

in server/src/config/redis/redis.ts
```ts
import IORedis from 'ioredis';
import { redisConfig } from './env.config';
import logger from '@/shared/utils/logger.util';

const redis = new IORedis({
  host: redisConfig.host,
  port: redisConfig.port,

  maxRetriesPerRequest: null,

  enableReadyCheck: false,
});

redis.on('connect', () => logger.info('[Redis] ✅ Connected'));
redis.on('error', (err) => logger.error('[Redis] ❌ Error:', err.message));

export default redis;
```

in server/src/config/llm.ts
```ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/config/llm.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { getEnvVariable } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';
import { GoogleGenAI } from '@google/genai';

const groqApiKey = getEnvVariable('GROQ_API_KEY', '');
const rawBaseUrl = getEnvVariable('LLM_BASE_URL', '');

export const llmClient = {
  isConfigured: Boolean(groqApiKey),
  apiKey: groqApiKey,
  baseUrl: rawBaseUrl,
};

if (!groqApiKey) {
  logger.warn('GROQ API key not configured — LLM features will be unavailable');
}

const geminiApiKey = getEnvVariable('GEMINI_API_KEY', '');

export const geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });

if (!geminiApiKey) {
  logger.warn('[Gemini] API key not configured — Scraper AI features will be unavailable');
} else {
  logger.info('[Gemini] ✅ Client initialized');
}

```