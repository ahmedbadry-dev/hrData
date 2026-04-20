export interface UserJob {
  company: string;
  role: string;
  major: string;
  city: string;
  date: string;
  email: string;
  hrEmail?: string;
  jobId?: string;
  isSaved?: boolean;
  previousFailedStatus?: 'FAILED';
}

export interface SavedJob extends UserJob {
  page: string;
  timestamp: string;
}

export interface UserApplication {
  id?: string;
  company: string;
  role: string;
  email: string;
  major: string;
  city: string;
  date: string | null;
  status: 'pending' | 'sent' | 'opened' | 'replied' | 'failed';
  retryCount?: number;
  errorMessage?: string | null;
}

export const mockJobs: UserJob[] = Array.from({ length: 20 }, (_, i) => ({
  company: [
    'مجموعة شاكر',
    'حلول الأغذية',
    'الشركة العربية',
    'روابي القابضة',
    'شركة التقنية',
    'مؤسسة النور',
    'شركة المستقبل',
    'مجموعة الخليج',
    'شركة الإبداع',
    'مؤسسة الريادة',
  ][i % 10],
  role: [
    'أخصائي مبيعات',
    'محاسب عام',
    'فني دعم تقني',
    'منسق إداري',
    'مطور برمجيات',
    'مصمم جرافيك',
    'مدير مشروع',
    'محلل بيانات',
    'أخصائي تسويق',
    'مهندس شبكات',
  ][i % 10],
  major: [
    'إدارة أعمال',
    'محاسبة / مالية',
    'تقنية معلومات',
    'إدارة',
    'علوم حاسب',
    'تصميم',
    'هندسة',
    'إحصاء',
    'تسويق',
    'شبكات',
  ][i % 10],
  city: ['الرياض', 'جدة', 'الدمام', 'الخبر', 'مكة', 'المدينة', 'تبوك', 'أبها', 'الطائف', 'ينبع'][
    i % 10
  ],
  date: '٢٠٢٦/٠٤/٠٤',
  email: `recruitment${i + 1}@company.com`,
}));
