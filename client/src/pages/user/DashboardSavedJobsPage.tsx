import { useOutletContext } from 'react-router-dom';
import { UserSavedJobsSection } from '@/components/user/sections';
import type { DashboardContextType } from './UserDashboardLayout';

export default function DashboardSavedJobsPage() {
  const { savedJobs, removeSavedByIndex, removeAllSaved } =
    useOutletContext<DashboardContextType>();

  return (
    <UserSavedJobsSection
      savedJobs={savedJobs}
      onRemoveByIndex={removeSavedByIndex}
      onRemoveAll={removeAllSaved}
    />
  );
}
