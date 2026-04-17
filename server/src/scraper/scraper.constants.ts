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
  },
} as const;
