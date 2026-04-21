import { axiosClient, type ApiResponse, type PaginationMeta } from '@/services/api';

export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  category: string | null;
  description: string | null;
  hrEmail: string | null;
  source: string;
  sourceUrl: string | null;
  language: string;
  postedAt: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  isSaved?: boolean;
  qualification?: string;
  specialization?: string;
  previousFailedStatus?: 'FAILED';
}

export interface PaginatedJobs {
  jobs: Job[];
  pagination: PaginationMeta;
}

export interface GetJobsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  location?: string;
  category?: string;
  qualification?: string;
  specialization?: string;
  dateFilter?: string;
}

export const fetchJobs = async (params?: GetJobsParams): Promise<ApiResponse<PaginatedJobs>> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.keyword) searchParams.set('keyword', params.keyword);
  if (params?.location) searchParams.set('location', params.location.toUpperCase());
  if (params?.qualification) searchParams.set('qualification', params.qualification.toUpperCase());
  if (params?.specialization) searchParams.set('specialization', params.specialization.toUpperCase());
  if (params?.dateFilter) searchParams.set('dateFilter', params.dateFilter.toUpperCase());

  const { data } = await axiosClient.get<ApiResponse<PaginatedJobs>>(
    `/jobs?${searchParams.toString()}`
  );
  return data;
};

export const saveJob = async (jobId: string): Promise<ApiResponse<{ success: boolean }>> => {
  const { data } = await axiosClient.post<ApiResponse<{ success: boolean }>>(`/jobs/${jobId}/save`);
  return data;
};

export const unsaveJob = async (jobId: string): Promise<ApiResponse<{ success: boolean }>> => {
  const { data } = await axiosClient.delete<ApiResponse<{ success: boolean }>>(
    `/jobs/${jobId}/save`
  );
  return data;
};

export const saveJobs = async (
  jobIds: string[]
): Promise<ApiResponse<{ savedJobIds: string[]; alreadySavedJobIds: string[] }>> => {
  const { data } = await axiosClient.post<
    ApiResponse<{ savedJobIds: string[]; alreadySavedJobIds: string[] }>
  >('/jobs/bulk-save', { jobIds });
  return data;
};

export const unsaveJobs = async (
  jobIds?: string[]
): Promise<ApiResponse<{ removedJobIds: string[]; notSavedJobIds: string[] }>> => {
  const body = Array.isArray(jobIds) && jobIds.length > 0 ? { jobIds } : {};
  const { data } = await axiosClient.post<
    ApiResponse<{ removedJobIds: string[]; notSavedJobIds: string[] }>
  >('/jobs/bulk-unsave', body);
  return data;
};

export const fetchSavedJobs = async (
  params?: GetJobsParams
): Promise<ApiResponse<PaginatedJobs>> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.keyword) searchParams.set('keyword', params.keyword);
  if (params?.location) searchParams.set('location', params.location.toUpperCase());
  if (params?.qualification) searchParams.set('qualification', params.qualification.toUpperCase());
  if (params?.specialization) searchParams.set('specialization', params.specialization.toUpperCase());
  if (params?.dateFilter) searchParams.set('dateFilter', params.dateFilter.toUpperCase());

  const { data } = await axiosClient.get<ApiResponse<PaginatedJobs>>(
    `/jobs/saved?${searchParams.toString()}`
  );
  return data;
};

export const fetchEligibleSavedJobs = async (
  params?: GetJobsParams
): Promise<ApiResponse<PaginatedJobs>> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const { data } = await axiosClient.get<ApiResponse<PaginatedJobs>>(
    `/jobs/saved/eligible?${searchParams.toString()}`
  );
  return data;
};

export const jobsService = {
  fetchJobs,
  saveJob,
  unsaveJob,
  saveJobs,
  unsaveJobs,
  fetchSavedJobs,
  fetchEligibleSavedJobs,
};
