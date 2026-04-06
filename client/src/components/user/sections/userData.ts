export interface UserJob {
  company: string;
  role: string;
  major: string;
  city: string;
  date: string;
  email: string;
}

export interface SavedJob extends UserJob {
  page: string;
  timestamp: string;
}

export interface UserApplication {
  company: string;
  role: string;
  email: string;
  major: string;
  city: string;
  date: string;
  status: 'pending' | 'sent' | 'opened' | 'replied' | 'failed';
}

export const PAGE_NAME = '22.html';

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

export const getSavedJobs = (): SavedJob[] => {
  try {
    return JSON.parse(localStorage.getItem('savedJobs') || '[]') as SavedJob[];
  } catch {
    return [];
  }
};

export const setSavedJobs = (jobs: SavedJob[]) => {
  localStorage.setItem('savedJobs', JSON.stringify(jobs));
};

export const getApplications = (): UserApplication[] => {
  try {
    return JSON.parse(localStorage.getItem('applications') || '[]') as UserApplication[];
  } catch {
    return [];
  }
};

export const setApplications = (apps: UserApplication[]) => {
  localStorage.setItem('applications', JSON.stringify(apps));
};
