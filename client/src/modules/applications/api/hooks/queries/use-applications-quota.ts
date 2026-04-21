import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchApplicationsQuota } from '../../applications.service';
import { applicationsQueryKeys } from '../../applications.query-keys';
import type { UseQueryOptions as CustomUseQueryOptions } from '@/lib/react-query/types';

export const useApplicationsQuotaQueryOptions = () => {
  return queryOptions({
    queryKey: applicationsQueryKeys.quota,
    queryFn: fetchApplicationsQuota,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export type UseApplicationsQuotaQueryOptions = CustomUseQueryOptions<
  typeof useApplicationsQuotaQueryOptions
>;

export const useApplicationsQuota = (options?: UseApplicationsQuotaQueryOptions) => {
  return useQuery({ ...useApplicationsQuotaQueryOptions(), ...options });
};
