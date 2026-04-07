export interface HomeHeroStat {
  value: string;
  label: string;
}

export interface HomeHeroCard {
  company: string;
  role: string;
  city: string;
  major: string;
  email: string;
}

export interface HomeStep {
  number: string;
  title: string;
  body: string;
}

export type HomeFeatureIcon = 'mail' | 'star' | 'search' | 'grid';

export interface HomeFeature {
  icon: HomeFeatureIcon;
  title: string;
  body: string;
}

export const homeHeroStats: HomeHeroStat[] = [
  { value: '٢٠+', label: 'وظيفة متاحة' },
  { value: '١٠', label: 'شركة مشاركة' },
  { value: '١٠٠٪', label: 'تواصل مباشر' },
];

export const homeHeroCards: HomeHeroCard[] = [
  {
    company: 'مجموعة شاكر',
    role: 'أخصائي مبيعات',
    city: 'الرياض',
    major: 'إدارة أعمال',
    email: 'recruitment@shaker.com',
  },
  {
    company: 'شركة التقنية',
    role: 'مطور برمجيات',
    city: 'جدة',
    major: 'علوم حاسب',
    email: 'hr@tech.com',
  },
];

export const homeSteps: HomeStep[] = [
  {
    number: '01',
    title: 'تصفّح الوظائف',
    body: 'ابحث عن وظيفة تناسب تخصصك ومدينتك من بين عشرات الفرص المتاحة من شركات موثوقة في السوق السعودي.',
  },
  {
    number: '02',
    title: 'تواصل مباشرةً',
    body: 'أرسل سيرتك الذاتية مباشرةً على بريد الشركة — بدون نماذج معقدة أو انتظار طويل. تواصل شخصي وحقيقي.',
  },
  {
    number: '03',
    title: 'احفظ ونظّم',
    body: 'احفظ الوظائف التي تعجبك ونظّمها في قائمتك الشخصية. لا تفوّت أي فرصة واهتم بكل تفصيلة.',
  },
];

export const homeFeatures: HomeFeature[] = [
  {
    icon: 'mail',
    title: 'تواصل مباشر بلا وسيط',
    body: 'بريد الشركة ظاهر مباشرةً — أرسل ومتابع بنفسك. لا حواجز، لا طوابير، لا أنظمة وسيطة تأخذ وقتك.',
  },
  {
    icon: 'star',
    title: 'حفظ ومتابعة ذكية',
    body: 'احفظ الوظائف التي تهمك وارجع لها في أي وقت. قائمتك الشخصية محفوظة في جهازك ومتاحة دائماً.',
  },
  {
    icon: 'search',
    title: 'بحث سريع ودقيق',
    body: 'ابحث بالمسمى الوظيفي أو التخصص أو المدينة. نتائج فورية بدون انتظار وبدون إعلانات مزعجة.',
  },
  {
    icon: 'grid',
    title: 'مجاني تماماً',
    body: 'كُفُـؤ مجانية للباحثين عن عمل بالكامل — لا اشتراكات، لا رسوم خفية، لا إعلانات. فقط فرصة حقيقية.',
  },
];

export const homeQuote = {
  text: 'السوق السعودي يحتاج منصة تُقرّب الكفاءات من أصحاب العمل — مباشرةً وبدون ضجيج.',
  author: 'فريق كُفُـؤ · ٢٠٢٦',
};

export const homeCta = {
  titleTop: 'مستعد تبدأ',
  titleBottom: 'رحلتك الوظيفية؟',
  subtitle: 'أكثر من ٢٠ وظيفة بانتظارك الآن من شركات موثوقة في المملكة',
};

export const homeFooterLinks = [
  { label: 'سياسة الخصوصية', href: '#' },
  { label: 'الشروط والأحكام', href: '#' },
  { label: 'تواصل معنا', href: '#' },
];
