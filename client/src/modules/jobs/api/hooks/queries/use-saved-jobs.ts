import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { jobsService, type GetJobsParams } from '../../jobs.service';
import type {
  UseQueryOptions as CustomUseQueryOptions,
  UseInfiniteQueryOptions as CustomUseInfiniteQueryOptions,
} from '@/lib/react-query/types';

export const useSavedJobsQueryOptions = (params?: GetJobsParams) => {
  return {
    queryKey: ['saved-jobs', 'list', params] as const,
    queryFn: () => jobsService.fetchSavedJobs(params),
  };
};

export type UseSavedJobsQueryOptions = CustomUseQueryOptions<typeof useSavedJobsQueryOptions>;

export const useSavedJobs = (params?: GetJobsParams, options?: UseSavedJobsQueryOptions) => {
  return useQuery({ ...useSavedJobsQueryOptions(params), ...options });
};

export const useSavedJobsInfiniteQueryOptions = (params?: GetJobsParams) => {
  return {
    queryKey: ['saved-jobs', 'list', params] as const,
    queryFn: ({ pageParam = 1 }) => jobsService.fetchSavedJobs({ ...params, page: pageParam }),
    getNextPageParam: (lastPage: any) => {
      const { pagination } = lastPage.data;
      if (pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
  };
};

export type UseSavedJobsInfiniteQueryOptions = CustomUseInfiniteQueryOptions<
  typeof useSavedJobsInfiniteQueryOptions
>;

export const useSavedJobsList = (
  params?: GetJobsParams,
  options?: UseSavedJobsInfiniteQueryOptions
) => {
  return useInfiniteQuery({ ...useSavedJobsInfiniteQueryOptions(params), ...options });
};
