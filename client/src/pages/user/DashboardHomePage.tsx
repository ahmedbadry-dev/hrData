import { useOutletContext } from 'react-router-dom';
import { UserHomeSection } from '@/components/user/sections';
import type { DashboardContextType } from './UserDashboardLayout';

export default function DashboardHomePage() {
  const { savedJobs } = useOutletContext<DashboardContextType>();

  return <UserHomeSection savedCount={savedJobs.length} />;
}
