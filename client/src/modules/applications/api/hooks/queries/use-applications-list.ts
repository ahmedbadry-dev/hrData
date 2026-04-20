import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchApplicationsList } from '../../applications.service';
import type { UseQueryOptions as CustomUseQueryOptions } from '@/lib/react-query/types';
import {
  applicationsQueryKeys,
  type ApplicationsListParams,
} from '../../applications.query-keys';

export const useApplicationsListQueryOptions = (params?: ApplicationsListParams) => {
  return queryOptions({
    queryKey: applicationsQueryKeys.list(params),
    queryFn: () => fetchApplicationsList(params),
  });
};

export type UseApplicationsListQueryOptions = CustomUseQueryOptions<
  typeof useApplicationsListQueryOptions
>;

export const useApplicationsList = (
  params?: ApplicationsListParams,
  options?: UseApplicationsListQueryOptions
) => {
  return useQuery({ ...useApplicationsListQueryOptions(params), ...options });
};
