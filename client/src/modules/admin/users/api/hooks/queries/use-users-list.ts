import { useQuery, useInfiniteQuery, queryOptions } from '@tanstack/react-query';
import { fetchUsersList } from '../../users.service';

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

export const useUsersListQueryOptions = (params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}) => {
  return queryOptions({
    queryKey: [...ADMIN_USERS_QUERY_KEY, 'list', params] as const,
    queryFn: () => fetchUsersList(params),
  });
};

export type UseUsersListQueryOptions = ReturnType<typeof useUsersListQueryOptions>;

export const useUsersList = (params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}) => {
  return useQuery(useUsersListQueryOptions(params));
};

export const useUsersListInfiniteQueryOptions = (params?: {
  limit?: number;
  keyword?: string;
  status?: string;
}) => {
  return {
    queryKey: [...ADMIN_USERS_QUERY_KEY, 'list', params] as const,
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      fetchUsersList({ ...params, page: pageParam }),
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

export type UseUsersListInfiniteQueryOptions = ReturnType<typeof useUsersListInfiniteQueryOptions>;

export const useUsersListInfinite = (params?: {
  limit?: number;
  keyword?: string;
  status?: string;
}) => {
  return useInfiniteQuery(useUsersListInfiniteQueryOptions(params));
};
