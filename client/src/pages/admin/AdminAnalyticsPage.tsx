import { AdminAnalyticsSection } from '@/components/admin/sections';
import {
  useAnalyticsOverview,
  useAnalyticsAdvancedOverview,
  useApplicationsPerDay,
  useApplicationStatusDistribution,
  useUserActivityPerDay,
} from '@/modules/admin/analytics/api/hooks';

export default function AdminAnalyticsPage() {
  const { data: overview, isLoading: isOverviewLoading } = useAnalyticsOverview();
  const { data: advanced } = useAnalyticsAdvancedOverview();
  const { data: applicationsPerDay } = useApplicationsPerDay(30);
  const { data: statusDist } = useApplicationStatusDistribution();
  const { data: userActivity } = useUserActivityPerDay(7);

  return (
    <AdminAnalyticsSection
      overview={overview?.data}
      advanced={advanced?.data}
      applicationsPerDay={applicationsPerDay?.data}
      statusDistribution={statusDist?.data}
      userActivity={userActivity?.data}
      isOverviewLoading={isOverviewLoading}
    />
  );
}
