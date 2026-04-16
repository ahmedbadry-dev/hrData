// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
