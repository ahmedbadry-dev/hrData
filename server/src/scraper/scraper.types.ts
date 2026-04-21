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

export interface ExtractedJob {
  title: string;
  companyName: string;
  source: string;
  location: string;
  qualification: string;
  specialization: string;
  category: string;
  description: string;
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
