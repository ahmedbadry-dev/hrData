import { useQuery, queryOptions } from '@tanstack/react-query';
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
