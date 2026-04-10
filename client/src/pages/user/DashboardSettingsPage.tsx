import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { UserSettingsSection } from '@/components/user/sections';
import type { DashboardContextType } from './UserDashboardLayout';

export default function DashboardSettingsPage() {
  const { gmailConnected, savedJobs, connectGmail, disconnectGmail } =
    useOutletContext<DashboardContextType>();

  const location = useLocation();
  const navigate = useNavigate();
  
  const returnToAutoApply = location.state?.returnToAutoApply || false;

  const handleConnect = async () => {
    await connectGmail();
    if (returnToAutoApply) {
      navigate('/dashboard/auto-apply');
    }
  };

  return (
    <UserSettingsSection
      gmailConnected={gmailConnected}
      savedCount={savedJobs.length}
      returnToAutoApply={returnToAutoApply}
      onConnect={handleConnect}
      onDisconnect={disconnectGmail}
      onGoAutoApply={() => navigate('/dashboard/auto-apply')}
    />
  );
}
