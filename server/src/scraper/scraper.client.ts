import axios from 'axios';
import * as cheerio from 'cheerio';
import Bottleneck from 'bottleneck';
import logger from '@/shared/utils/logger.util';
import { geminiClient } from '@/config/llm';
import {
  AI_REQUESTS_PER_MINUTE,
  JOB_RESPONSE_SCHEMA,
  MAX_CONTENT_CHARS,
  VALID_LOCATIONS,
} from './scraper.config';
import type { WebSiteConfig, ExtractedJob, JobLinksResult } from './scraper.types';

interface FetchHtmlResult {
  ok: boolean;
  html: string | null;
  errorMessage: string | null;
  statusCode: number | null;
}

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
  static async fetchHtmlResult(url: string, retries = 3): Promise<FetchHtmlResult> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data, status } = await this.httpClient.get<string>(url);
        return { ok: true, html: data, errorMessage: null, statusCode: status };
      } catch (error: unknown) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status === 404 || status === 403) {
          return {
            ok: false,
            html: null,
            errorMessage: `HTTP ${status}`,
            statusCode: status,
          };
        }
        if (status === 429) {
          await new Promise((r) => setTimeout(r, 10000));
          continue;
        }
        if (attempt === retries) {
          return {
            ok: false,
            html: null,
            errorMessage: error instanceof Error ? error.message : 'Failed to fetch HTML',
            statusCode: typeof status === 'number' ? status : null,
          };
        }
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
    return {
      ok: false,
      html: null,
      errorMessage: 'Failed to fetch HTML after retries',
      statusCode: null,
    };
  }

  static async fetchHtml(url: string, retries = 3): Promise<string | null> {
    const result = await this.fetchHtmlResult(url, retries);
    return result.ok ? result.html : null;
  }

  static async getJobLinksResult(site: WebSiteConfig): Promise<JobLinksResult> {
    let html: string | null;
    let statusCode: number | null;

    if (site.ajaxConfig) {
      try {
        const { data, status } = await this.httpClient.post(
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
        statusCode = status;
        html = data?.html ?? null;
      } catch (error) {
        logger.error(`[Scraper] AJAX fetch failed for ${site.name}: ${error}`);
        return {
          ok: false,
          links: [],
          errorMessage: error instanceof Error ? error.message : String(error),
          statusCode: null,
        };
      }
    } else {
      const fetchResult = await this.fetchHtmlResult(site.url);
      if (!fetchResult.ok) {
        return {
          ok: false,
          links: [],
          errorMessage: fetchResult.errorMessage,
          statusCode: fetchResult.statusCode,
        };
      }
      html = fetchResult.html;
      statusCode = fetchResult.statusCode;
    }

    if (!html) {
      return {
        ok: false,
        links: [],
        errorMessage: 'Source returned empty HTML',
        statusCode,
      };
    }

    const $ = cheerio.load(html);
    const links: string[] = [];
    $(site.jobLinkSelector).each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const fullUrl = href.startsWith('http') ? href : `${site.baseUrl}${href}`;
      if (!links.includes(fullUrl)) links.push(fullUrl);
    });
    return { ok: true, links, errorMessage: null, statusCode };
  }

  static async getJobLinks(site: WebSiteConfig): Promise<string[]> {
    const result = await this.getJobLinksResult(site);
    if (!result.ok) return [];
    return result.links;
  }

  static async getJobContent(jobUrl: string, site: WebSiteConfig): Promise<string | null> {
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
          contents: `Extract the following structured JSON from this job posting. Return ONLY valid JSON, no markdown, no explanation.\n\nRules:\n- All values must be strings\n- title, companyName, category, description, experience, and languageRequirement MUST be extracted in Arabic language\n- experience must describe the required experience, for example "لا يشترط", "1-3 سنوات", or "3 سنوات فأكثر"\n- If required experience is not mentioned, use "غير محدد"\n- languageRequirement must describe whether English language is required. Use exactly one of: "اللغة الإنجليزية مطلوبة", "اللغة الإنجليزية غير مطلوبة", "غير محدد"\n- If English language requirement is not mentioned, use "غير محدد"\n- language means the job post language only. Use "ar" for Arabic posts and "en" for English posts\n- location must be exactly one of: ${VALID_LOCATIONS.join(', ')}\n- qualification must be exactly one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, PHD, OTHER\n- specialization must be exactly one of: ENGINEERING, INFORMATION_TECHNOLOGY, BUSINESS_ADMINISTRATION, ACCOUNTING_FINANCE, MARKETING_SALES, HEALTHCARE, EDUCATION, HUMAN_RESOURCES, OTHER\n- If a field cannot be determined, use "OTHER"\n- Return ONLY the JSON object (or array if multiple jobs found)\n\nContent:\n${content}`,
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[Scraper] AI Error: ${errorMessage}`);
      return null;
    }
  }
}
