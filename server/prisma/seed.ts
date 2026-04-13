import { PrismaClient, UserRole, UserStatus, ApplicationStatus } from '../generated/prisma';

const prisma = new PrismaClient();
const TEST_HR_EMAIL = process.env.TEST_HR_EMAIL || 'test@kafoo.test';

const usersData = [
  {
    firstName: 'أحمد',
    lastName: 'عمري',
    email: 'ahmed@example.com',
    phone: '0501111111',
    status: 'ACTIVE',
  },
  {
    firstName: 'سارة',
    lastName: 'غامدي',
    email: 'sara@example.com',
    phone: '0502222222',
    status: 'ACTIVE',
  },
  {
    firstName: 'محمد',
    lastName: 'زهراني',
    email: 'mohammed@example.com',
    phone: '0503333333',
    status: 'PENDING_VERIFICATION',
  },
  {
    firstName: 'نورة',
    lastName: 'قحطاني',
    email: 'noura@example.com',
    phone: '0504444444',
    status: 'SUSPENDED',
  },
  {
    firstName: 'عبدالله',
    lastName: 'الحربي',
    email: 'abdullah@example.com',
    phone: '0505555555',
    status: 'ACTIVE',
  },
];

const activityLogsData = Array.from({ length: 50 }, (_, i) => ({
  action: ['view_job', 'save_job', 'apply_job', 'login'][i % 4] as
    | 'view_job'
    | 'save_job'
    | 'apply_job'
    | 'login',
  details: `Job action ${i + 1}`,
}));

const jobsData = [
  {
    title: 'مدير العقود',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف إدارية وتقنية وهندسية - إدارة العقود والتعاقدات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'مدير عام التطوير والعمليات',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف إدارية وتقنية وهندسية - تطوير العمليات وإدارتها',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'مشرف البيانات والذكاء الاصطناعي',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'IT',
    description: 'وظائف إدارية وتقنية وهندسية - إشراف على البيانات والذكاء الاصطناعي',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'مشرف مكتب الخدمة',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'IT',
    description: 'وظائف إدارية وتقنية وهندسية - إشراف مكتب الخدمة',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'أخصائي أول مراقبة عمليات',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وهندسية - مراقبة العمليات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'أخصائي أول إدارة فعاليات',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Marketing',
    description: 'وظائف إدارية وتقنية وهندسية - إدارة الفعاليات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'أخصائي تخطيط وأداء الأعمال',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وهندسية - تخطيط الأعمال',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'مهندس حلول',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف إدارية وتقنية وهندسية - هندسة الحلول',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'مهندس حلول أول',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف إدارية وتقنية وهندسية - هندسة الحلول أول',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'أخصائي تميز المشاريع',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وهندسية - تميز المشاريع',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'مسؤول تميز الموردين الرقميين',
    companyName: 'الشركة الوطنية للإسكان',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وهندسية - تميز الموردين',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84927',
    language: 'ar',
  },
  {
    title: 'مدير موقع',
    companyName: 'الشركة السعودية للخدمات المحدودة',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف هندسية وفنية - إدارة الموقع',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84926',
    language: 'ar',
  },
  {
    title: 'مهندس ميكانيكا',
    companyName: 'الشركة السعودية للخدمات المحدودة',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف هندسية وفنية - هندسة الميكانيكا',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84926',
    language: 'ar',
  },
  {
    title: 'فني ميكانيكا',
    companyName: 'الشركة السعودية للخدمات المحدودة',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف هندسية وفنية - فني ميكانيكا',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84926',
    language: 'ar',
  },
  {
    title: 'مهندس كهرباء',
    companyName: 'الشركة السعودية للخدمات المحدودة',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف هندسية وفنية - هندسة الكهرباء',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84926',
    language: 'ar',
  },
  {
    title: 'فني كهرباء',
    companyName: 'الشركة السعودية للخدمات المحدودة',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف هندسية وفنية - فني كهرباء',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84926',
    language: 'ar',
  },
  {
    title: 'مهندس مدني',
    companyName: 'الشركة السعودية للخدمات المحدودة',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف هندسية وفنية - هندسة مدنية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84926',
    language: 'ar',
  },
  {
    title: 'فني مدني',
    companyName: 'الشركة السعودية للخدمات المحدودة',
    location: 'RIYADH',
    category: 'Engineering',
    description: 'وظائف هندسية وفنية - فني مدني',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84926',
    language: 'ar',
  },
  {
    title: 'أخصائي سكرتارية اللجنة الوطنية',
    companyName: 'الهيئة العامة للطيران المدني',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وقانونية - سكرتارية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84925',
    language: 'ar',
  },
  {
    title: 'أخصائي تكامل',
    companyName: 'الهيئة العامة للطيران المدني',
    location: 'RIYADH',
    category: 'IT',
    description: 'وظائف إدارية وتقنية وقانونية - تكامل',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84925',
    language: 'ar',
  },
  {
    title: 'مدير إدارة المراجعة المالية والإدارية',
    companyName: 'الهيئة العامة للطيران المدني',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وقانونية - المراجعة المالية والإدارية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84925',
    language: 'ar',
  },
  {
    title: 'مشرف مراجعة تقنية المعلومات والأمن السيبراني',
    companyName: 'الهيئة العامة للطيران المدني',
    location: 'RIYADH',
    category: 'IT',
    description: 'وظائف إدارية وتقنية وقانونية - الأمن السيبراني',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84925',
    language: 'ar',
  },
  {
    title: 'دكتوراه الفلسفة في الهندسة الكهربائية',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - دكتوراه في الهندسة الكهربائية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'دكتوراه في فلسفة الحوسبة',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - دكتوراه في الحوسبة',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'ماجستير التصوير المقطعي',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - ماجستير التصوير المقطعي',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'ماجستير العلاج الطبيعي للأطفال',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - ماجستير العلاج الطبيعي',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'ماجستير الصيدلة الصناعية',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - ماجستير الصيدلة الصناعية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'ماجستير هندسة نظم الاتصالات',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - ماجستير هندسة الاتصالات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'ماجستير الهندسة الميكانيكية',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - ماجستير الهندسة الميكانيكية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'ماجستير علم البيانات',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - ماجستير علم البيانات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'ماجستير إدارة الأعمال',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - ماجستير إدارة الأعمال',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'ماجستير القانون الخاص',
    companyName: 'جامعة الأمير سطام',
    location: 'TABUK',
    category: 'Education',
    description: 'برامج الدراسات العليا - ماجستير القانون الخاص',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84922',
    language: 'ar',
  },
  {
    title: 'برنامج التدريب المبتدئ بالتوظيف',
    companyName: 'المعهد السعودي التقني لخدمات الكهرباء',
    location: 'JEDDAH',
    category: 'Education',
    description: 'برنامج تدريب منتهي بالتوظيف',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84921',
    language: 'ar',
  },
  {
    title: 'برنامج التدريب التعاوني',
    companyName: 'شركة ياسرف',
    location: 'JEDDAH',
    category: 'Education',
    description: 'برنامج تدريب تعاوني لعام 2026م',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84920',
    language: 'ar',
  },
  {
    title: 'برنامج التدريب التعاوني',
    companyName: 'شركة علم',
    location: 'RIYADH',
    category: 'Education',
    description: 'برنامج تدريب تعاوني لعام 2026م',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84918',
    language: 'ar',
  },
  {
    title: 'برنامج التدريب المنتهي بالتوظيف',
    companyName: 'شركة خدمات الملاحة الجوية السعودية',
    location: 'RIYADH',
    category: 'Education',
    description: 'برنامج تدريب منتهي بالتوظيف - مراقب جوي',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84917',
    language: 'ar',
  },
  {
    title: 'برنامج هامات لتطوير الخريجين',
    companyName: 'KPMG',
    location: 'RIYADH',
    category: 'Finance',
    description: 'برنامج هامات لتطوير الخريجين',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84914',
    language: 'ar',
  },
  {
    title: 'معلم حاسب آلي',
    companyName: 'المعهد العالي للتقنيات الورقية والصناعية',
    location: 'JEDDAH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - معلم حاسب آلي',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84913',
    language: 'ar',
  },
  {
    title: 'منسق شؤون متدربين',
    companyName: 'المعهد العالي للتقنيات الورقية والصناعية',
    location: 'JEDDAH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - منسق شؤون متدربين',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84913',
    language: 'ar',
  },
  {
    title: 'أخصائي علوم بيانات',
    companyName: 'المؤسسة العامة لجسر الملك فهد',
    location: 'DAMMAM',
    category: 'IT',
    description: 'وظائف تقنية وهندسية - أخصائي علوم بيانات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84912',
    language: 'ar',
  },
  {
    title: 'مهندس أول البنية التحتية',
    companyName: 'المؤسسة العامة لجسر الملك فهد',
    location: 'DAMMAM',
    category: 'Engineering',
    description: 'وظائف تقنية وهندسية - مهندس البنية التحتية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84912',
    language: 'ar',
  },
  {
    title: 'رئيس مركز الاتصال',
    companyName: 'مجلس الضمان الصحي',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف قيادية وتخصصية - رئيس مركز الاتصال',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84909',
    language: 'ar',
  },
  {
    title: 'رئيس قسم هندسة وعمليات البيانات',
    companyName: 'مجلس الضمان الصحي',
    location: 'RIYADH',
    category: 'IT',
    description: 'وظائف قيادية وتخصصية - هندسة وعمليات البيانات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84909',
    language: 'ar',
  },
  {
    title: 'رئيس قسم البنية المؤسسية والحوكمة الرقمية',
    companyName: 'مجلس الضمان الصحي',
    location: 'RIYADH',
    category: 'IT',
    description: 'وظائف قيادية وتخصصية - الحوكمة الرقمية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84909',
    language: 'ar',
  },
  {
    title: 'كبير أخصائيين مراجعة العمليات التشغيلية',
    companyName: 'مجلس الضمان الصحي',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف قيادية وتخصصية - مراجعة العمليات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84909',
    language: 'ar',
  },
  {
    title: 'كبير أخصائي إدارة البيانات',
    companyName: 'مجلس الضمان الصحي',
    location: 'RIYADH',
    category: 'IT',
    description: 'وظائف قيادية وتخصصية - إدارة البيانات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84909',
    language: 'ar',
  },
  {
    title: 'معلمة لغة إنجليزية',
    companyName: 'مدارس دريم العالمية',
    location: 'RIYADH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - معلم لغة إنجليزية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84908',
    language: 'ar',
  },
  {
    title: 'معلمة رياضيات',
    companyName: 'مدارس دريم العالمية',
    location: 'RIYADH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - معلم رياضيات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84908',
    language: 'ar',
  },
  {
    title: 'معلمة علوم',
    companyName: 'مدارس دريم العالمية',
    location: 'RIYADH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - معلم علوم',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84908',
    language: 'ar',
  },
  {
    title: 'معلمة لغة عربية',
    companyName: 'مدارس دريم العالمية',
    location: 'RIYADH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - معلم لغة عربية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84908',
    language: 'ar',
  },
  {
    title: 'معلمة تربية إسلامية',
    companyName: 'مدارس دريم العالمية',
    location: 'RIYADH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - معلم تربية إسلامية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84908',
    language: 'ar',
  },
  {
    title: 'مشرفة حضانة',
    companyName: 'مدارس دريم العالمية',
    location: 'RIYADH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - مشرفة حضانة',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84908',
    language: 'ar',
  },
  {
    title: 'وكيلة',
    companyName: 'مدارس دريم العالمية',
    location: 'RIYADH',
    category: 'Education',
    description: 'وظائف تعليمية وإدارية - وكيلة school',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84908',
    language: 'ar',
  },
  {
    title: 'خبير تحقيقات الشركات',
    companyName: 'هيئة الزكاة والضريبة والجمارك',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وقانونية - تحقيقات الشركات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84906',
    language: 'ar',
  },
  {
    title: 'أخصائي تسجيل',
    companyName: 'هيئة الزكاة والضريبة والجمارك',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وقانونية - أخصائي تسجيل',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84906',
    language: 'ar',
  },
  {
    title: 'خبير عمليات الأعمال',
    companyName: 'هيئة الزكاة والضريبة والجمارك',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وقانونية - خبير عمليات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84906',
    language: 'ar',
  },
  {
    title: 'خبير استراتيجية',
    companyName: 'هيئة الزكاة والضريبة والجمارك',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وقانونية - خبير استراتيجية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84906',
    language: 'ar',
  },
  {
    title: 'أخصائي أول تقييم',
    companyName: 'هيئة الزكاة والضريبة والجمارك',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف إدارية وتقنية وقانونية - أخصائي تقييم',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84906',
    language: 'ar',
  },
  {
    title: 'مدير قسم مكتب خدمة تقنية المعلومات',
    companyName: 'هيئة الزكاة والضريبة والجمارك',
    location: 'RIYADH',
    category: 'IT',
    description: 'وظائف إدارية وتقنية وقانونية - مدير تقنية المعلومات',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84906',
    language: 'ar',
  },
  {
    title: 'ممثل مركز اتصال',
    companyName: 'مصرف الإنماء',
    location: 'RIYADH',
    category: 'Finance',
    description: 'وظائف مركز اتصال - دردشة مباشرة',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84905',
    language: 'ar',
  },
  {
    title: 'طاقم الضيافة الجوية',
    companyName: 'طيران ناس',
    location: 'RIYADH',
    category: 'HR',
    description: 'وظائف طاقم الضيافة الجوية',
    source: 'ewdifh',
    sourceUrl: 'https://www.ewdifh.com/jobs/84903',
    language: 'ar',
  },
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Seed users
  const createdUsers = [];
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        role: UserRole.USER,
        status: userData.status as UserStatus,
        emailVerified: userData.status === 'ACTIVE',
        passwordHash: '$2a$10$dummyhashfordemopurposes',
        createdAt: randomDate(thirtyDaysAgo, now),
      },
    });
    createdUsers.push(user);
  }
  console.log(`Seeded ${usersData.length} users`);

  // Seed jobs
  for (const jobData of jobsData) {
    const postedAt = randomDate(thirtyDaysAgo, now);
    const expiresAt = randomDate(now, thirtyDaysFromNow);

    await prisma.job.create({
      data: {
        title: jobData.title,
        companyName: jobData.companyName,
        location: jobData.location as
          | 'RIYADH'
          | 'JEDDAH'
          | 'DAMMAM'
          | 'KHOBAR'
          | 'MECCA'
          | 'MEDINA'
          | 'TABUK',
        category: jobData.category,
        description: jobData.description,
        hrEmail: TEST_HR_EMAIL,
        source: jobData.source,
        sourceUrl: jobData.sourceUrl,
        language: jobData.language,
        postedAt,
        expiresAt,
        isExpired: false,
      },
    });
  }
  console.log(`Seeded ${jobsData.length} jobs`);

  // Seed applications for analytics
  for (const user of createdUsers.slice(0, 3)) {
    for (const job of await prisma.job.findMany({ take: 10 })) {
      const statuses = [
        ApplicationStatus.SENT,
        ApplicationStatus.EMAIL_SENT,
        ApplicationStatus.EMAIL_OPENED,
        ApplicationStatus.FAILED,
        ApplicationStatus.SCHEDULED,
      ];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const scheduledAt =
        status === ApplicationStatus.SCHEDULED ? randomDate(now, thirtyDaysFromNow) : null;
      const sentAt = [
        ApplicationStatus.SENT,
        ApplicationStatus.EMAIL_SENT,
        ApplicationStatus.EMAIL_OPENED,
      ].includes(status)
        ? randomDate(sevenDaysAgo, now)
        : null;

      await prisma.application.create({
        data: {
          userId: user.id,
          jobId: job.id,
          status,
          scheduledAt,
          sentAt,
          createdAt: randomDate(thirtyDaysAgo, now),
        },
      });
    }
  }
  console.log('Seeded applications for analytics');

  // Seed activity logs for user activity chart
  for (const user of createdUsers) {
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      if (Math.random() > 0.3) {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: activityLogsData[i % activityLogsData.length].action,
            details: activityLogsData[i % activityLogsData.length].details,
            createdAt: date,
          },
        });
      }
    }
  }
  console.log('Seeded activity logs for user activity');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
