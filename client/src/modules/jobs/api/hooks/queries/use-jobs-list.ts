import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { jobsService, type GetJobsParams } from '../../jobs.service';
import type {
  UseQueryOptions as CustomUseQueryOptions,
  UseInfiniteQueryOptions as CustomUseInfiniteQueryOptions,
} from '@/lib/react-query/types';

export const useJobsListQueryOptions = (params?: GetJobsParams) => {
  return {
    queryKey: ['jobs', 'list', params] as const,
    queryFn: () => jobsService.fetchJobs(params),
  };
};

export type UseJobsListQueryOptions = CustomUseQueryOptions<typeof useJobsListQueryOptions>;

export const useJobsListQuery = (params?: GetJobsParams, options?: UseJobsListQueryOptions) => {
  return useQuery({ ...useJobsListQueryOptions(params), ...options });
};

export const useJobsListInfiniteQueryOptions = (params?: GetJobsParams) => {
  return {
    queryKey: ['jobs', 'list', params] as const,
    queryFn: ({ pageParam = 1 }) => jobsService.fetchJobs({ ...params, page: pageParam }),
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

export type UseJobsListInfiniteQueryOptions = CustomUseInfiniteQueryOptions<
  typeof useJobsListInfiniteQueryOptions
>;

export const useJobsList = (params?: GetJobsParams, options?: UseJobsListInfiniteQueryOptions) => {
  return useInfiniteQuery({ ...useJobsListInfiniteQueryOptions(params), ...options });
};
