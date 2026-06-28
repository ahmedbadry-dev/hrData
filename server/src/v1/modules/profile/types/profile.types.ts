import { JobQualification, JobSpecialization, LanguageLevel } from '@prisma/client';

export interface ProfilePersonalResponse {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  summary: string;
}

export interface ProfileExperienceResponse {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProfileLanguageResponse {
  id: string;
  name: string;
  level: LanguageLevel;
}

export interface ProfileEducationResponse {
  qualification: JobQualification | '';
  specialization: JobSpecialization | '';
  institution: string;
  graduationYear: string;
}

export interface ProfileResponse {
  profile: ProfilePersonalResponse;
  experience: ProfileExperienceResponse[];
  skills: string[];
  languages: ProfileLanguageResponse[];
  education: ProfileEducationResponse;
}
