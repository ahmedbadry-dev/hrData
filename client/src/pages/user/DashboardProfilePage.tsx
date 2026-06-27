import {
  UserProfileSection,
  type UserEducationValues,
  type UserExperienceEntry,
  type UserLanguageEntry,
  type UserProfileFormValues,
} from '@/components/user/sections';
import { useAuth } from '@/modules/auth/api/hooks';

const TEMP_PROFILE_FALLBACK: UserProfileFormValues = {
  firstName: 'محمد',
  lastName: 'العتيبي',
  email: 'm.alatybi@email.com',
  phone: '+966 50 123 4567',
  summary:
    'مطور برمجيات متخصص في تطوير الويب والتطبيقات، أمتلك خبرة تزيد على 5 سنوات في بناء حلول تقنية متكاملة.',
};

const TEMP_EXPERIENCE_FALLBACK: UserExperienceEntry[] = [
  {
    id: 'experience-1',
    jobTitle: 'مطور ويب أول',
    company: 'شركة تقنية الرياض',
    startDate: '2021-03',
    endDate: '2024-08',
    description:
      'قيادة فريق تطوير مكون من 4 مطورين، وتسليم 3 مشاريع كبرى في الموعد المحدد.',
  },
  {
    id: 'experience-2',
    jobTitle: 'مطور جونيور',
    company: 'شركة إبداع للتقنية',
    startDate: '2019-06',
    endDate: '2021-02',
    description: 'تطوير واجهات مستخدم تفاعلية باستخدام React وتكاملها مع الـ APIs.',
  },
];

const TEMP_SKILLS_FALLBACK: string[] = [];

const TEMP_LANGUAGES_FALLBACK: UserLanguageEntry[] = [
  {
    id: 'language-ar',
    name: 'العربية',
    level: 'fluent',
  },
  {
    id: 'language-en',
    name: 'الإنجليزية',
    level: 'intermediate',
  },
];

const TEMP_EDUCATION_FALLBACK: UserEducationValues = {
  qualification: 'BAC',
  specialization: 'IT',
  institution: 'جامعة الملك سعود',
  graduationYear: '2020',
};

export default function DashboardProfilePage() {
  const { data: authData } = useAuth();
  const user = authData.user;

  const initialProfile: UserProfileFormValues = {
    firstName: user?.firstName || TEMP_PROFILE_FALLBACK.firstName,
    lastName: user?.lastName || TEMP_PROFILE_FALLBACK.lastName,
    email: user?.email || TEMP_PROFILE_FALLBACK.email,
    phone: TEMP_PROFILE_FALLBACK.phone,
    summary: TEMP_PROFILE_FALLBACK.summary,
  };

  return (
    <UserProfileSection
      initialProfile={initialProfile}
      initialExperience={TEMP_EXPERIENCE_FALLBACK}
      initialSkills={TEMP_SKILLS_FALLBACK}
      initialLanguages={TEMP_LANGUAGES_FALLBACK}
      initialEducation={TEMP_EDUCATION_FALLBACK}
    />
  );
}
