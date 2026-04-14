import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { UserSettingsSection } from '@/components/user/sections';
import type { DashboardContextType } from './UserDashboardLayout';
import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/api/hooks';

export default function DashboardSettingsPage() {
  const { gmailConnected, gmailEmail, savedJobs, connectGmail, disconnectGmail } =
    useOutletContext<DashboardContextType>();
  const { restoreGmailConnection } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    if (search.get('gmailConnected') !== 'true') {
      return;
    }

    void restoreGmailConnection();
    navigate('/dashboard/settings', { replace: true, state: location.state });
  }, [location.search, location.state, navigate, restoreGmailConnection]);

  useEffect(() => {
    if (!gmailConnected) {
      return;
    }

    if (sessionStorage.getItem('returnToAutoApplyAfterGmail') !== 'true') {
      return;
    }

    sessionStorage.removeItem('returnToAutoApplyAfterGmail');
    navigate('/dashboard/auto-apply', { replace: true });
  }, [gmailConnected, navigate]);

  const queryParams = new URLSearchParams(location.search);
  const returnToAutoApply =
    location.state?.returnToAutoApply || queryParams.get('returnToAutoApply') === 'true';

  const handleConnect = async () => {
    if (returnToAutoApply) {
      sessionStorage.setItem('returnToAutoApplyAfterGmail', 'true');
    }

    await connectGmail();
  };

  const handleDisconnect = async () => {
    await disconnectGmail();
  };

  return (
    <UserSettingsSection
      gmailConnected={gmailConnected}
      gmailEmail={gmailEmail}
      savedCount={savedJobs.length}
      returnToAutoApply={returnToAutoApply}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onGoAutoApply={() => (window.location.href = '/dashboard/auto-apply')}
    />
  );
}
