// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/scraper/scraper.config.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { SiteConfig } from './scraper.types';

// قائمة المواقع اللي هتسكرب منها
export const SITES_CONFIG: SiteConfig[] = [
  {
    name: 'ewdifh',
    url: 'https://www.ewdifh.com/category/corporate-jobs',
    jobLinkSelector: 'div.grid a[href*="/jobs/"]',
    jobContentSelector: 'div.card-body',
    baseUrl: 'https://www.ewdifh.com',
  },
  {
    name: 'wadifh',
    url: 'https://www.jobs-1.com/jobs/archive/8', // صفحة الوظائف الشركات
    baseUrl: 'https://www.jobs-1.com',

    jobLinkSelector: 'div.bl-news-item a[href*="www.jobs-1.com/1"]',

    jobContentSelector: 'div.bl-detail-page',
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
};

export const DELAY_BETWEEN_SITES_MS = 2000;

export const MAX_CONCURRENT_REQUESTS = 5;

export const MAX_CONTENT_CHARS = 6000;

export const AI_REQUESTS_PER_MINUTE = 4;
