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
