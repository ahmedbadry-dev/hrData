// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/scraper/scraper.types.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface WebSiteConfig {
  name: string;
  type: 'web';
  url: string;
  jobLinkSelector: string;
  jobContentSelector: string;
  baseUrl: string;
  allowEmptyLinks?: boolean;
  ajaxConfig?: {
    endpoint: string;
    params: Record<string, string>;
  };
}

export interface ApiSourceConfig {
  name: string;
  type: 'api';
  apiUrl: string;
  verifyUrl: string;
  searchPhrases: string[];
  authToken: string;
}

export type SiteConfig = WebSiteConfig | ApiSourceConfig;

export const SCRAPER_SOURCE_STATES = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  ACTIVE: 'ACTIVE',
  NO_DATA: 'NO_DATA',
  FAILED: 'FAILED',
  STALE: 'STALE',
  DISABLED: 'DISABLED',
} as const;

export type ScraperSourceState = (typeof SCRAPER_SOURCE_STATES)[keyof typeof SCRAPER_SOURCE_STATES];

export interface ScraperSourceDefinition {
  sourceName: string;
  displayName: string;
  type: SiteConfig['type'];
}

export interface ScraperSourceStatus extends ScraperSourceDefinition {
  enabled: boolean;
  state: ScraperSourceState;
  runId: string | null;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  linksFound: number;
  jobsScraped: number;
  failureCount: number;
  consecutiveFailureCount: number;
  durationMs: number | null;
  updatedAt: string;
}

export interface ScraperSourceRunResult {
  runId: string;
  linksFound: number;
  jobsScraped: number;
  durationMs: number;
}

export interface JobLinksResult {
  ok: boolean;
  links: string[];
  errorMessage: string | null;
  statusCode: number | null;
}

export interface ExtractedJob {
  title: string;
  companyName: string;
  source: string;
  location: string;
  qualification: string;
  specialization: string;
  category: string;
  description: string;
  experience: string;
  languageRequirement: string;
  hrEmail: string | null;
  sourceUrl: string;
  language: string;
  postedAt: string | null;
  expiresAt: string | null;
}

export interface TwitterJob {
  id: string;
  text: string;
  emails: string[];
  relativeTime: string;
  sourceUrl: string;
}
