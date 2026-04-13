import { useOutletContext } from 'react-router-dom';
import { UserHomeSection } from '@/components/user/sections';
import type { DashboardContextType } from './UserDashboardLayout';

export default function DashboardHomePage() {
  const {
    savedJobs,
    applicationsCount,
    repliesCount,
    totalJobs,
    weeklySentCounts,
    isLoadingSaved,
  } = useOutletContext<DashboardContextType>();

  if (isLoadingSaved) {
    return null;
  }

  return (
    <UserHomeSection
      savedCount={savedJobs?.length || 0}
      applicationsCount={applicationsCount || 0}
      repliesCount={repliesCount || 0}
      totalJobs={totalJobs || 0}
      weeklyData={weeklySentCounts}
    />
  );
}
