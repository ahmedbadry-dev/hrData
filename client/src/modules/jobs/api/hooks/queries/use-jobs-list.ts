import { useQuery } from '@tanstack/react-query';
import { jobsService, type GetJobsParams } from '../../jobs.service';
import type { UseQueryOptions as CustomUseQueryOptions } from '@/lib/react-query/types';

export const useJobsListQueryOptions = (params?: GetJobsParams) => {
  return {
    queryKey: ['jobs', 'list', params] as const,
    queryFn: () => jobsService.fetchJobs(params),
  };
};

export type UseJobsListQueryOptions = CustomUseQueryOptions<typeof useJobsListQueryOptions>;

export const useJobsList = (params?: GetJobsParams, options?: UseJobsListQueryOptions) => {
  return useQuery({ ...useJobsListQueryOptions(params), ...options });
};
