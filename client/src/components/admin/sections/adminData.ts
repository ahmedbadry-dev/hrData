export interface AdminUser {
  id: string | number;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'suspended' | 'pending_verification';
  applied: number;
  saved: number;
  joined: string;
  rowIndex?: number;
}

export interface AdminAnnouncement {
  id: number;
  title: string;
  body: string;
  type: 'info' | 'warn' | 'success' | 'danger';
  target: string;
  date: string;
}

export const NOTIFICATION_TYPE_TO_UI: Record<string, AdminAnnouncement['type']> = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warn',
  ALERT: 'danger',
};

export interface AdminLog {
  type: 'reg' | 'apply' | 'error' | 'info';
  text: string;
  time: string;
  typeLabel: string;
  color: string;
}

export interface ScraperLog {
  t: 'green' | 'yellow' | 'red' | 'gray';
  m: string;
}

export const initialAdminUsers: AdminUser[] = [
  {
    id: 1,
    name: 'أحمد العمري',
    phone: '0501234567',
    email: 'ahmed@email.com',
    status: 'active',
    applied: 12,
    saved: 8,
    joined: '٢٠٢٦/٠١/١٢',
  },
  {
    id: 2,
    name: 'سارة الغامدي',
    phone: '0559876543',
    email: 'sara@email.com',
    status: 'active',
    applied: 7,
    saved: 15,
    joined: '٢٠٢٦/٠١/١٨',
  },
  {
    id: 3,
    name: 'محمد الزهراني',
    phone: '0531122334',
    email: 'moh@email.com',
    status: 'suspended',
    applied: 3,
    saved: 2,
    joined: '٢٠٢٦/٠٢/٠٣',
  },
  {
    id: 4,
    name: 'نورة القحطاني',
    phone: '0554433221',
    email: 'noura@email.com',
    status: 'active',
    applied: 20,
    saved: 11,
    joined: '٢٠٢٦/٠٢/١٤',
  },
  {
    id: 5,
    name: 'عبدالله الشهري',
    phone: '0567788990',
    email: 'abdo@email.com',
    status: 'active',
    applied: 5,
    saved: 3,
    joined: '٢٠٢٦/٠٢/٢٢',
  },
  {
    id: 6,
    name: 'ريم الدوسري',
    phone: '0512345678',
    email: 'reem@email.com',
    status: 'active',
    applied: 9,
    saved: 7,
    joined: '٢٠٢٦/٠٣/٠١',
  },
  {
    id: 7,
    name: 'فيصل المطيري',
    phone: '0523456789',
    email: 'faisal@email.com',
    status: 'suspended',
    applied: 1,
    saved: 0,
    joined: '٢٠٢٦/٠٣/٠٥',
  },
  {
    id: 8,
    name: 'هند العتيبي',
    phone: '0534567890',
    email: 'hend@email.com',
    status: 'active',
    applied: 14,
    saved: 9,
    joined: '٢٠٢٦/٠٣/١٠',
  },
  {
    id: 9,
    name: 'خالد البقمي',
    phone: '0545678901',
    email: 'khaled@email.com',
    status: 'active',
    applied: 6,
    saved: 4,
    joined: '٢٠٢٦/٠٣/١٨',
  },
  {
    id: 10,
    name: 'لمى الحربي',
    phone: '0556789012',
    email: 'lama@email.com',
    status: 'active',
    applied: 18,
    saved: 13,
    joined: '٢٠٢٦/٠٣/٢٢',
  },
];

export const initialAdminAnnouncements: AdminAnnouncement[] = [
  {
    id: 1,
    title: 'تحديث النظام',
    body: 'تم تحديث النظام إلى الإصدار 2.4 بنجاح. شكراً لكم على الصبر.',
    type: 'success',
    target: 'جميع المستخدمين',
    date: '٢٠٢٦/٠٤/٠٤',
  },
  {
    id: 2,
    title: 'صيانة مجدولة',
    body: 'سيكون النظام في وضع الصيانة يوم الجمعة ٨ أبريل من الساعة ٢ إلى ٤ فجراً.',
    type: 'warn',
    target: 'جميع المستخدمين',
    date: '٢٠٢٦/٠٤/٠٥',
  },
  {
    id: 3,
    title: 'فشل إرسال بريد',
    body: 'رصد النظام أخطاء في إرسال بعض رسائل SMTP. يُراجع الفريق التقني المسألة.',
    type: 'danger',
    target: 'إدارة النظام',
    date: '٢٠٢٦/٠٤/٠٦',
  },
];

export const recentAdminLogs: AdminLog[] = [
  {
    type: 'reg',
    text: 'تسجيل مستخدم جديد — لمى الحربي',
    time: '١٠:٤٢ ص',
    typeLabel: 'تسجيل',
    color: '#1a4a8a',
  },
  {
    type: 'apply',
    text: 'تقديم آلي — أحمد العمري — ٥ رسائل',
    time: '١٠:٣٨ ص',
    typeLabel: 'تقديم',
    color: '#1a6b4a',
  },
  {
    type: 'apply',
    text: 'تقديم آلي — نورة القحطاني — ٣ رسائل',
    time: '١٠:١٥ ص',
    typeLabel: 'تقديم',
    color: '#1a6b4a',
  },
  {
    type: 'error',
    text: 'فشل إرسال بريد — محمد الزهراني — SMTP Error',
    time: '٠٩:٥٥ ص',
    typeLabel: 'خطأ',
    color: '#c0392b',
  },
  {
    type: 'reg',
    text: 'تسجيل مستخدم جديد — خالد البقمي',
    time: '٠٩:٤٠ ص',
    typeLabel: 'تسجيل',
    color: '#1a4a8a',
  },
  {
    type: 'apply',
    text: 'تقديم آلي — ريم الدوسري — ٧ رسائل',
    time: '٠٩:٢٢ ص',
    typeLabel: 'تقديم',
    color: '#1a6b4a',
  },
  {
    type: 'info',
    text: 'تحديث قاعدة الوظائف — ٢٠ وظيفة جديدة',
    time: '٠٩:٠٠ ص',
    typeLabel: 'نظام',
    color: '#b8860b',
  },
];

export const initialScraperLogs: ScraperLog[] = [
  { t: 'green', m: '[10:42:01] ✓ جلسة سكراب بدأت بنجاح' },
  { t: 'yellow', m: '[10:42:03] ← جاري الاتصال بـ LinkedIn...' },
  { t: 'green', m: '[10:42:05] ✓ تم استخراج 8 وظائف جديدة' },
  { t: 'yellow', m: '[10:42:08] ← جاري الاتصال بـ Bayt.com...' },
  { t: 'green', m: '[10:42:10] ✓ تم استخراج 5 وظائف جديدة' },
  { t: 'yellow', m: '[10:42:12] ← جاري معالجة البيانات...' },
  { t: 'green', m: '[10:42:14] ✓ تم تحديث قاعدة البيانات — 13 وظيفة مضافة' },
  { t: 'gray', m: '[10:42:15] — انتظار الجولة القادمة (٣٠ دقيقة)...' },
];
