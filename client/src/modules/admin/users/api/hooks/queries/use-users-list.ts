import { useQuery, queryOptions } from '@tanstack/react-query';
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
    staleTime: 0,
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
