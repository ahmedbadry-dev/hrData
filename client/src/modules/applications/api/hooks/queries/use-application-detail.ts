import { useQuery, queryOptions } from '@tanstack/react-query';
import { fetchApplicationDetail } from '../../applications.service';
import { APPLICATIONS_QUERY_KEY } from './use-applications-list';

export const useApplicationDetailQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: [...APPLICATIONS_QUERY_KEY, 'detail', id] as const,
    queryFn: () => fetchApplicationDetail(id),
    enabled: !!id,
  });
};

export const useApplicationDetail = (id: string) => {
  return useQuery(useApplicationDetailQueryOptions(id));
};
