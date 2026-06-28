import { axiosClient, type ApiResponse } from '@/services/api';

export type ProfileLanguageLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE';

export type ProfileQualification =
  | 'HIGH_SCHOOL'
  | 'DIPLOMA'
  | 'BACHELOR'
  | 'MASTER'
  | 'PHD'
  | 'OTHER';

export type ProfileSpecialization =
  | 'ENGINEERING'
  | 'INFORMATION_TECHNOLOGY'
  | 'BUSINESS_ADMINISTRATION'
  | 'ACCOUNTING_FINANCE'
  | 'MARKETING_SALES'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'HUMAN_RESOURCES'
  | 'OTHER';

export interface ProfilePersonal {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  summary: string;
}

export interface ProfileExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProfileLanguage {
  id: string;
  name: string;
  level: ProfileLanguageLevel;
}

export interface ProfileEducation {
  qualification: ProfileQualification | '';
  specialization: ProfileSpecialization | '';
  institution: string;
  graduationYear: string;
}

export interface ProfileData {
  profile: ProfilePersonal;
  experience: ProfileExperience[];
  skills: string[];
  languages: ProfileLanguage[];
  education: ProfileEducation;
}

export type UpdatePersonalProfileRequest = Omit<ProfilePersonal, 'email'>;

export interface UpdateExperienceRequest {
  experiences: Array<Omit<ProfileExperience, 'id'>>;
}

export interface UpdateEducationSkillsRequest extends ProfileEducation {
  skills: string[];
  languages: Array<Omit<ProfileLanguage, 'id'>>;
}

const fetchProfile = async (): Promise<ApiResponse<ProfileData>> => {
  const { data } = await axiosClient.get<ApiResponse<ProfileData>>('/profile/me');
  return data;
};

const updatePersonal = async (
  payload: UpdatePersonalProfileRequest
): Promise<ApiResponse<ProfileData>> => {
  const { data } = await axiosClient.patch<ApiResponse<ProfileData>>(
    '/profile/me/personal',
    payload
  );
  return data;
};

const updateExperience = async (
  payload: UpdateExperienceRequest
): Promise<ApiResponse<ProfileData>> => {
  const { data } = await axiosClient.put<ApiResponse<ProfileData>>(
    '/profile/me/experience',
    payload
  );
  return data;
};

const updateEducationSkills = async (
  payload: UpdateEducationSkillsRequest
): Promise<ApiResponse<ProfileData>> => {
  const { data } = await axiosClient.put<ApiResponse<ProfileData>>(
    '/profile/me/education-skills',
    payload
  );
  return data;
};

export const profileService = {
  fetchProfile,
  updatePersonal,
  updateExperience,
  updateEducationSkills,
};
