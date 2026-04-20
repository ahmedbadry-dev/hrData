import { queryOptions, useQuery } from '@tanstack/react-query';
import { jobsService, type GetJobsParams } from '../../jobs.service';
import type { UseQueryOptions as CustomUseQueryOptions } from '@/lib/react-query/types';
import { jobsQueryKeys } from '../../jobs.query-keys';

export const useSavedJobsQueryOptions = (params?: GetJobsParams) => {
  return queryOptions({
    queryKey: jobsQueryKeys.saved(params),
    queryFn: () => jobsService.fetchSavedJobs(params),
  });
};

export type UseSavedJobsQueryOptions = CustomUseQueryOptions<typeof useSavedJobsQueryOptions>;

export const useSavedJobsList = (params?: GetJobsParams, options?: UseSavedJobsQueryOptions) => {
  return useQuery({ ...useSavedJobsQueryOptions(params), ...options });
};
