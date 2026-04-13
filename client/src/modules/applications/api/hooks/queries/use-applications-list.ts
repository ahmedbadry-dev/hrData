import { useQuery, useInfiniteQuery, queryOptions } from '@tanstack/react-query';
import { fetchApplicationsList } from '../../applications.service';

export const APPLICATIONS_QUERY_KEY = ['applications'] as const;

export const useApplicationsListQueryOptions = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return queryOptions({
    queryKey: [...APPLICATIONS_QUERY_KEY, 'list', params] as const,
    queryFn: () => fetchApplicationsList(params),
  });
};

export type UseApplicationsListQueryOptions = ReturnType<typeof useApplicationsListQueryOptions>;

export const UseApplicationsList = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery(useApplicationsListQueryOptions(params));
};

export const useApplicationsListInfiniteQueryOptions = (params?: {
  limit?: number;
  status?: string;
}) => {
  return {
    queryKey: [...APPLICATIONS_QUERY_KEY, 'list', params] as const,
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      fetchApplicationsList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage: any) => {
      const { pagination } = lastPage.data;
      if (pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
    refetchInterval: 10000,
  };
};

export type UseApplicationsListInfiniteQueryOptions = ReturnType<
  typeof useApplicationsListInfiniteQueryOptions
>;

export const UseApplicationsListInfinite = (params?: { limit?: number; status?: string }) => {
  return useInfiniteQuery(useApplicationsListInfiniteQueryOptions(params));
};
