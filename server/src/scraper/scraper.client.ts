import axios from 'axios';
import * as cheerio from 'cheerio';
import Bottleneck from 'bottleneck';
import logger from '@/shared/utils/logger.util';
import { geminiClient } from '@/config/llm';
import { AI_REQUESTS_PER_MINUTE, JOB_RESPONSE_SCHEMA, MAX_CONTENT_CHARS, VALID_LOCATIONS } from './scraper.config';
import { WebSiteConfig, ExtractedJob } from './scraper.types';

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

  static async getJobLinks(site: WebSiteConfig): Promise<string[]> {
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
          contents: `Extract the following structured JSON from this job posting. Return ONLY valid JSON, no markdown, no explanation.\n\nRules:\n- All values must be strings\n- title, companyName, category, description, and experience MUST be extracted in Arabic language\n- experience must describe the required experience, for example "لا يشترط", "1-3 سنوات", or "3 سنوات فأكثر"\n- If required experience is not mentioned, use "غير محدد"\n- location must be exactly one of: ${VALID_LOCATIONS.join(', ')}\n- qualification must be exactly one of: HIGH_SCHOOL, DIPLOMA, BACHELOR, MASTER, PHD, OTHER\n- specialization must be exactly one of: ENGINEERING, INFORMATION_TECHNOLOGY, BUSINESS_ADMINISTRATION, ACCOUNTING_FINANCE, MARKETING_SALES, HEALTHCARE, EDUCATION, HUMAN_RESOURCES, OTHER\n- If a field cannot be determined, use "OTHER"\n- Return ONLY the JSON object (or array if multiple jobs found)\n\nContent:\n${content}`,
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
