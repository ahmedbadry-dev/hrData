import { useQuery, queryOptions } from '@tanstack/react-query';
import {
  fetchAnalyticsOverview,
  fetchAnalyticsAdvancedOverview,
  fetchLoginsPerDay,
  fetchApplicationsPerDay,
  fetchEmailErrorsPerDay,
  fetchUserActivityPerDay,
  fetchTopAppliedJobs,
  fetchApplicationStatusDistribution,
  fetchRecentActivityLogs,
} from '../analytics.service';

export const ADMIN_ANALYTICS_QUERY_KEY = ['admin', 'analytics'] as const;

export const useAnalyticsOverviewQueryOptions = () => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'overview'] as const,
    queryFn: () => fetchAnalyticsOverview(),
  });
};

export type UseAnalyticsOverviewQueryOptions = ReturnType<typeof useAnalyticsOverviewQueryOptions>;

export const useAnalyticsOverview = () => {
  return useQuery(useAnalyticsOverviewQueryOptions());
};

export const useAnalyticsAdvancedOverviewQueryOptions = () => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'advanced-overview'] as const,
    queryFn: () => fetchAnalyticsAdvancedOverview(),
  });
};

export type UseAnalyticsAdvancedOverviewQueryOptions = ReturnType<
  typeof useAnalyticsAdvancedOverviewQueryOptions
>;

export const useAnalyticsAdvancedOverview = () => {
  return useQuery(useAnalyticsAdvancedOverviewQueryOptions());
};

export const useLoginsPerDayQueryOptions = (days: number = 7) => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'logins', days] as const,
    queryFn: () => fetchLoginsPerDay(days),
  });
};

export const useLoginsPerDay = (days: number = 7) => {
  return useQuery(useLoginsPerDayQueryOptions(days));
};

export const useApplicationsPerDayQueryOptions = (days: number = 7) => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'applications', days] as const,
    queryFn: () => fetchApplicationsPerDay(days),
  });
};

export const useApplicationsPerDay = (days: number = 7) => {
  return useQuery(useApplicationsPerDayQueryOptions(days));
};

export const useEmailErrorsPerDayQueryOptions = (days: number = 7) => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'errors', days] as const,
    queryFn: () => fetchEmailErrorsPerDay(days),
  });
};

export const useEmailErrorsPerDay = (days: number = 7) => {
  return useQuery(useEmailErrorsPerDayQueryOptions(days));
};

export const useUserActivityPerDayQueryOptions = (days: number = 7) => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'activity', days] as const,
    queryFn: () => fetchUserActivityPerDay(days),
  });
};

export const useUserActivityPerDay = (days: number = 7) => {
  return useQuery(useUserActivityPerDayQueryOptions(days));
};

export const useTopAppliedJobsQueryOptions = (limit: number = 10) => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'top-jobs', limit] as const,
    queryFn: () => fetchTopAppliedJobs(limit),
  });
};

export const useTopAppliedJobs = (limit: number = 10) => {
  return useQuery(useTopAppliedJobsQueryOptions(limit));
};

export const useApplicationStatusDistributionQueryOptions = () => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'status-distribution'] as const,
    queryFn: () => fetchApplicationStatusDistribution(),
  });
};

export type UseApplicationStatusDistributionQueryOptions = ReturnType<
  typeof useApplicationStatusDistributionQueryOptions
>;

export const useApplicationStatusDistribution = () => {
  return useQuery(useApplicationStatusDistributionQueryOptions());
};

export const useRecentActivityLogsQueryOptions = () => {
  return queryOptions({
    queryKey: [...ADMIN_ANALYTICS_QUERY_KEY, 'recent-logs'] as const,
    queryFn: () => fetchRecentActivityLogs(30),
  });
};

export const useRecentActivityLogs = () => {
  return useQuery(useRecentActivityLogsQueryOptions());
};
