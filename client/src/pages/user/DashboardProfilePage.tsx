import { useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/common';
import {
  UserProfileSection,
  type UserEducationSkillsValues,
  type UserExperienceEntry,
  type UserProfileFormValues,
} from '@/components/user/sections';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/modules/auth/api/hooks';
import {
  profileQueryKeys,
  type ProfileData,
  type ProfileQualification,
  type ProfileSpecialization,
  useProfile,
  useUpdatePersonalProfile,
  useUpdateProfileEducationSkills,
  useUpdateProfileExperience,
} from '@/modules/profile';
import type { ApiResponse } from '@/services/api';

type ProfileApiResponse = ApiResponse<ProfileData>;

const PROFILE_STALE_TIME_MS = 2 * 60 * 1000;

const EMPTY_PROFILE_DATA: ProfileData = {
  profile: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    summary: '',
  },
  experience: [],
  skills: [],
  languages: [],
  education: {
    qualification: '',
    specialization: '',
    institution: '',
    graduationYear: '',
  },
};

const updateProfileCache =
  (queryClient: ReturnType<typeof useQueryClient>) => (response: ProfileApiResponse) => {
    queryClient.setQueryData(profileQueryKeys.me(), response);
  };

export default function DashboardProfilePage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: authData, setSession } = useAuth();
  const setProfileCache = updateProfileCache(queryClient);

  const { data, isLoading, isFetching, isError } = useProfile({
    staleTime: PROFILE_STALE_TIME_MS,
    refetchOnMount: true,
  });

  const personalMutation = useUpdatePersonalProfile({
    onSuccess: (response) => {
      setProfileCache(response);

      const savedProfile = response.data?.profile;
      if (savedProfile && authData.user && authData.accessToken) {
        setSession({
          accessToken: authData.accessToken,
          user: {
            ...authData.user,
            firstName: savedProfile.firstName,
            lastName: savedProfile.lastName,
            fullName: `${savedProfile.firstName} ${savedProfile.lastName}`,
          },
        });
      }
    },
  });

  const experienceMutation = useUpdateProfileExperience({
    onSuccess: setProfileCache,
  });

  const educationSkillsMutation = useUpdateProfileEducationSkills({
    onSuccess: setProfileCache,
  });

  const profileData = data?.data;
  const isProfileLoading = isLoading || (isFetching && !profileData);

  const handleSavePersonal = async (profile: UserProfileFormValues) => {
    await personalMutation.mutateAsync({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      summary: profile.summary,
    });
    showToast({ message: 'تم حفظ المعلومات الشخصية', type: 'success' });
  };

  const handleSaveExperience = async (experience: UserExperienceEntry[]) => {
    await experienceMutation.mutateAsync({
      experiences: experience.map(({ jobTitle, company, startDate, endDate, description }) => ({
        jobTitle,
        company,
        startDate,
        endDate,
        description,
      })),
    });
    showToast({ message: 'تم حفظ الخبرة المهنية', type: 'success' });
  };

  const handleSaveEducationSkills = async ({
    education,
    skills,
    languages,
  }: UserEducationSkillsValues) => {
    await educationSkillsMutation.mutateAsync({
      qualification: education.qualification as ProfileQualification | '',
      specialization: education.specialization as ProfileSpecialization | '',
      institution: education.institution,
      graduationYear: education.graduationYear,
      skills,
      languages: languages.map(({ name, level }) => ({ name, level })),
    });
    showToast({ message: 'تم حفظ التعليم والمهارات', type: 'success' });
  };

  if (isError && !profileData) {
    return (
      <section>
        <EmptyState
          symbol="!"
          title="تعذر تحميل الملف الشخصي"
          description="يرجى إعادة المحاولة بعد قليل"
        />
      </section>
    );
  }

  const visibleProfileData = profileData ?? EMPTY_PROFILE_DATA;

  return (
    <UserProfileSection
      isLoading={isProfileLoading}
      initialProfile={visibleProfileData.profile}
      initialExperience={visibleProfileData.experience}
      initialSkills={visibleProfileData.skills}
      initialLanguages={visibleProfileData.languages}
      initialEducation={visibleProfileData.education}
      onSavePersonal={handleSavePersonal}
      onSaveExperience={handleSaveExperience}
      onSaveEducationSkills={handleSaveEducationSkills}
    />
  );
}
