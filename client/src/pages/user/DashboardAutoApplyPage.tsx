import { useOutletContext, useNavigate } from 'react-router-dom';
import { UserAutoApplySection } from '@/components/user/sections';
import type { DashboardContextType } from './UserDashboardLayout';

export default function DashboardAutoApplyPage() {
  const { savedJobs, gmailConnected, gmailEmail, startSending } =
    useOutletContext<DashboardContextType>();
  const navigate = useNavigate();

  return (
    <UserAutoApplySection
      savedJobs={savedJobs}
      gmailConnected={gmailConnected}
      gmailEmail={gmailEmail}
      onGoToSettings={() => navigate('/dashboard/settings', { state: { returnToAutoApply: true } })}
      onGoSavedJobs={() => navigate('/dashboard/saved-jobs')}
      onStartSending={startSending}
      onGoAnalytics={() => navigate('/dashboard/analysis')}
      onGoHome={() => navigate('/dashboard')}
    />
  );
}
