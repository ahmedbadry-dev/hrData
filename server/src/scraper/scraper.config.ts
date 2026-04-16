// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/scraper/scraper.config.ts
// وظيفته: إعدادات الـ 10 مواقع + الثوابت المشتركة
// لو عايز تضيف موقع جديد — بتضيفه في SITES_CONFIG بس
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { SiteConfig } from './scraper.types';

// قائمة المواقع اللي هتسكرب منها
export const SITES_CONFIG: SiteConfig[] = [
  {
    name: 'ewdifh',
    url: 'https://www.ewdifh.com/category/corporate-jobs',
    // من تحليل الـ HTML: الروابط موجودة في <a href="/jobs/...">
    jobLinkSelector: 'div.grid a[href*="/jobs/"]',
    // من تحليل الـ HTML: محتوى الوظيفة كله جوّا div.card-body
    jobContentSelector: 'div.card-body',
    baseUrl: 'https://www.ewdifh.com',
  },
  {
    name: 'wadifh',
    url: 'https://www.jobs-1.com/jobs/archive/8', // صفحة الوظائف الشركات
    baseUrl: 'https://www.jobs-1.com',

    // الروابط: <a href="https://www.jobs-1.com/10411">
    // الـ URL كامل (absolute) — مش محتاج baseUrl
    // بس ممكن يكون relative زي /10411 في صفحات تانية
    // الـ selector: كل <a> جوّا div.bl-news-item
    jobLinkSelector: 'div.bl-news-item a[href*="www.jobs-1.com/1"]',

    // محتوى الوظيفة: div.card-body ثم div.bl-detail-page
    // بس div.card-body كافية وهتجيب كل النص
    jobContentSelector: 'div.bl-detail-page',
  },
];

// الـ locations الصحيحة من الـ Prisma enum بتاعك
// بنستخدمها للـ validation قبل الحفظ في الـ DB
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

// الـ JSON Schema اللي بنبعته لـ Gemini كـ responseSchema
// ده هو Structured Output — الـ AI ملزم يرجع JSON
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

// الوقت بالـ ms بين كل موقع وتاني — عشان ما نكونش aggressive
export const DELAY_BETWEEN_SITES_MS = 2000;

// أقصى عدد requests تتم في نفس الوقت لكل موقع
export const MAX_CONCURRENT_REQUESTS = 5;

// أقصى عدد حروف من محتوى الوظيفة نبعته للـ Gemini
export const MAX_CONTENT_CHARS = 6000;

export const AI_REQUESTS_PER_MINUTE = 4;
