import { useQuery, queryOptions } from '@tanstack/react-query';
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
    staleTime: 1000 * 60 * 5,
    refetchInterval: 5 * 1000,
  });
};

export type UseApplicationsListQueryOptions = ReturnType<typeof useApplicationsListQueryOptions>;

export const useApplicationsList = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery(useApplicationsListQueryOptions(params));
};
