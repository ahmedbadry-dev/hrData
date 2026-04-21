import { AdminAnalyticsSection } from '@/components/admin/sections';
import { useAdminAnalytics } from '@/modules/admin/analytics/api/hooks';

export default function AdminAnalyticsPage() {
  const [overviewRes, advancedRes, appsPerDayRes, statusDistRes, userActivityRes] =
    useAdminAnalytics();

  const overview = overviewRes.data?.data;
  const advanced = advancedRes.data?.data;
  const applicationsPerDay = appsPerDayRes.data?.data;
  const statusDist = statusDistRes.data?.data;
  const userActivity = userActivityRes.data?.data;

  const isOverviewLoading = overviewRes.isLoading;

  return (
    <AdminAnalyticsSection
      overview={overview}
      advanced={advanced}
      applicationsPerDay={applicationsPerDay}
      statusDistribution={statusDist}
      userActivity={userActivity}
      isOverviewLoading={isOverviewLoading}
    />
  );
}
