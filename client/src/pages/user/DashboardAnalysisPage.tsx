import { useOutletContext } from 'react-router-dom';
import { UserAnalyticsSection } from '@/components/user/sections';
import type { DashboardContextType } from './UserDashboardLayout';

export default function DashboardAnalysisPage() {
  const { applications } = useOutletContext<DashboardContextType>();

  return <UserAnalyticsSection applications={applications} />;
}
