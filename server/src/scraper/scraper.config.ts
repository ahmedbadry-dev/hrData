// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/scraper/scraper.config.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { SiteConfig } from './scraper.types';

// قائمة المواقع اللي هتسكرب منها
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
    jobContentSelector: 'div.job_description',
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
