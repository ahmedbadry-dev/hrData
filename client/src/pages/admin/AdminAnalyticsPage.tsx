import { AdminAnalyticsSection } from '@/components/admin/sections';
import {
  useAnalyticsOverview,
  useAnalyticsAdvancedOverview,
  useTopAppliedJobs,
  useApplicationsPerDay,
  useApplicationStatusDistribution,
  useUserActivityPerDay,
} from '@/modules/admin/analytics/api/hooks';

export default function AdminAnalyticsPage() {
  const { data: overview } = useAnalyticsOverview();
  const { data: advanced } = useAnalyticsAdvancedOverview();
  const { data: topJobs } = useTopAppliedJobs(5);
  const { data: applicationsPerDay } = useApplicationsPerDay(30);
  const { data: statusDist } = useApplicationStatusDistribution();
  const { data: userActivity } = useUserActivityPerDay(7);

  return (
    <AdminAnalyticsSection
      overview={overview?.data}
      advanced={advanced?.data}
      topJobs={topJobs?.data}
      applicationsPerDay={applicationsPerDay?.data}
      statusDistribution={statusDist?.data}
      userActivity={userActivity?.data}
    />
  );
}
