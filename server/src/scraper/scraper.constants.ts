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
    RUN_LOCK_SECONDS: 6 * 60 * 60,
    WORKER_HEARTBEAT_TTL_SECONDS: 90,
  },
  THRESHOLDS: {
    SOURCE_RUNNING_STALE_AFTER_MS: 3 * 60 * 60 * 1000,
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
    SITE_FAILURE: (name: string, error: unknown) => `[Scraper] Site Failure (${name}): ${error}`,
    EXCEPTION: (url: string, error: unknown) => `[Scraper] Exception processing ${url}: ${error}`,
    LOCK_ERROR: (error: unknown) => `[Scraper] Critical Redis error while handling lock: ${error}`,
  },
} as const;
