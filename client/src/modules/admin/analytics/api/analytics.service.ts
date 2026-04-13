import { axiosClient } from '@/services/api';
import type {
  OverviewStats,
  AdvancedOverviewStats,
  DailyDataPoint,
  UserActivityDataPoint,
  TopJobDataPoint,
  ApplicationStatusDistribution,
} from './types';

export const fetchAnalyticsOverview = async (): Promise<{ data: OverviewStats }> => {
  const { data } = await axiosClient.get('/admin/analytics/overview');
  return data;
};

export const fetchAnalyticsAdvancedOverview = async (): Promise<{
  data: AdvancedOverviewStats;
}> => {
  const { data } = await axiosClient.get('/admin/analytics/advanced-overview');
  return data;
};

export const fetchLoginsPerDay = async (days: number = 7): Promise<{ data: DailyDataPoint[] }> => {
  const { data } = await axiosClient.get('/admin/analytics/logins-per-day', { params: { days } });
  return data;
};

export const fetchApplicationsPerDay = async (
  days: number = 7
): Promise<{ data: DailyDataPoint[] }> => {
  const { data } = await axiosClient.get('/admin/analytics/applications-per-day', {
    params: { days },
  });
  return data;
};

export const fetchEmailErrorsPerDay = async (
  days: number = 7
): Promise<{ data: DailyDataPoint[] }> => {
  const { data } = await axiosClient.get('/admin/analytics/email-errors-per-day', {
    params: { days },
  });
  return data;
};

export const fetchUserActivityPerDay = async (
  days: number = 7
): Promise<{ data: UserActivityDataPoint[] }> => {
  const { data } = await axiosClient.get('/admin/analytics/user-activity-per-day', {
    params: { days },
  });
  return data;
};

export const fetchTopAppliedJobs = async (
  limit: number = 10
): Promise<{ data: TopJobDataPoint[] }> => {
  const { data } = await axiosClient.get('/admin/analytics/top-jobs', { params: { limit } });
  return data;
};

export const fetchApplicationStatusDistribution = async (): Promise<{
  data: ApplicationStatusDistribution;
}> => {
  const { data } = await axiosClient.get('/admin/analytics/application-status-distribution');
  return data;
};
