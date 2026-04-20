import { queryOptions, useQuery } from '@tanstack/react-query';
import { jobsService, type GetJobsParams } from '../../jobs.service';
import type { UseQueryOptions as CustomUseQueryOptions } from '@/lib/react-query/types';
import { jobsQueryKeys } from '../../jobs.query-keys';

export const useEligibleSavedJobsQueryOptions = (params?: GetJobsParams) => {
  return queryOptions({
    queryKey: jobsQueryKeys.savedEligible(params),
    queryFn: () => jobsService.fetchEligibleSavedJobs(params),
  });
};

export type UseEligibleSavedJobsQueryOptions = CustomUseQueryOptions<
  typeof useEligibleSavedJobsQueryOptions
>;

export const useEligibleSavedJobsList = (
  params?: GetJobsParams,
  options?: UseEligibleSavedJobsQueryOptions
) => {
  return useQuery({ ...useEligibleSavedJobsQueryOptions(params), ...options });
};
