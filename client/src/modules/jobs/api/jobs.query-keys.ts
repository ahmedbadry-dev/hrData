import type { GetJobsParams } from './jobs.service';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const normalizeKeyword = (value?: string): string => value?.trim() ?? '';
const normalizeLocation = (value?: string): string => value?.trim() ?? '';
const normalizeQualification = (value?: string): string => value?.trim() ?? '';
const normalizeSpecialization = (value?: string): string => value?.trim() ?? '';
const normalizeDateFilter = (value?: string): string => value?.trim() ?? '';

export const normalizeJobsListQueryParams = (params?: GetJobsParams) => ({
  page: params?.page ?? DEFAULT_PAGE,
  limit: params?.limit ?? DEFAULT_LIMIT,
  keyword: normalizeKeyword(params?.keyword),
  location: normalizeLocation(params?.location),
  qualification: normalizeQualification(params?.qualification),
  specialization: normalizeSpecialization(params?.specialization),
  dateFilter: normalizeDateFilter(params?.dateFilter),
});

export const normalizeSavedJobsQueryParams = (params?: GetJobsParams) => ({
  page: params?.page ?? DEFAULT_PAGE,
  limit: params?.limit ?? DEFAULT_LIMIT,
});

export const normalizeEligibleSavedJobsQueryParams = (params?: GetJobsParams) => ({
  page: params?.page ?? DEFAULT_PAGE,
  limit: params?.limit ?? DEFAULT_LIMIT,
});

export const jobsQueryKeys = {
  all: ['jobs'] as const,
  stats: ['jobs', 'stats'] as const,
  list: (params?: GetJobsParams) => ['jobs', normalizeJobsListQueryParams(params)] as const,
  savedAll: ['jobs', 'saved'] as const,
  saved: (params?: GetJobsParams) =>
    ['jobs', 'saved', normalizeSavedJobsQueryParams(params)] as const,
  savedEligibleAll: ['jobs', 'saved', 'eligible'] as const,
  savedEligible: (params?: GetJobsParams) =>
    ['jobs', 'saved', 'eligible', normalizeEligibleSavedJobsQueryParams(params)] as const,
};
