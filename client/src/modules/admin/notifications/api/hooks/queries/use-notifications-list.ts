import { useQuery, useInfiniteQuery, queryOptions } from '@tanstack/react-query';
import { fetchNotificationsList } from '../../notifications.service';

export const ADMIN_NOTIFICATIONS_QUERY_KEY = ['admin', 'notifications'] as const;

export const useNotificationsListQueryOptions = (params?: { page?: number; limit?: number }) => {
  return queryOptions({
    queryKey: [...ADMIN_NOTIFICATIONS_QUERY_KEY, 'list', params] as const,
    queryFn: () => fetchNotificationsList(params),
  });
};

export type UseNotificationsListQueryOptions = ReturnType<typeof useNotificationsListQueryOptions>;

export const useNotificationsList = (params?: { page?: number; limit?: number }) => {
  return useQuery(useNotificationsListQueryOptions(params));
};

export const useNotificationsListInfiniteQueryOptions = (params?: { limit?: number }) => {
  return {
    queryKey: [...ADMIN_NOTIFICATIONS_QUERY_KEY, 'list', params] as const,
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      fetchNotificationsList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage: any) => {
      const { pagination } = lastPage.data;
      if (pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  };
};

export type UseNotificationsListInfiniteQueryOptions = ReturnType<
  typeof useNotificationsListInfiniteQueryOptions
>;

export const useNotificationsListInfinite = (params?: { limit?: number }) => {
  return useInfiniteQuery(useNotificationsListInfiniteQueryOptions(params));
};
