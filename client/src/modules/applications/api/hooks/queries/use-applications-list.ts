import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchApplicationsList } from '../../applications.service';
import type { UseQueryOptions as CustomUseQueryOptions } from '@/lib/react-query/types';
import {
  applicationsQueryKeys,
  type ApplicationsListParams,
} from '../../applications.query-keys';
import { ApplicationStatus } from '../../../types';

export const useApplicationsListQueryOptions = (params?: ApplicationsListParams) => {
  return queryOptions({
    queryKey: applicationsQueryKeys.list(params),
    queryFn: () => fetchApplicationsList(params),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,

    // Smart polling: Poll every 5s ONLY if there are active (in-progress) applications
    refetchInterval: (query) => {
      const data = query.state.data?.data;
      if (!data?.applications) return false;

      const hasActiveJobs = data.applications.some((app) =>
        [ApplicationStatus.SCHEDULED, ApplicationStatus.SENDING].includes(app.status)
      );

      return hasActiveJobs ? 5000 : false;
    },
    // Optimization: Stop polling when tab is in background to save bandwidth
    refetchIntervalInBackground: false,
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
