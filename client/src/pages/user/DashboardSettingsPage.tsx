import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserSettingsSection } from '@/components/user/sections';
import { useAuth } from '@/modules/auth/api/hooks';
import { useSavedJobsList } from '@/modules/jobs/api/hooks';

export default function DashboardSettingsPage() {
  const { data: authData, connectGmail, disconnectGmail, restoreGmailConnection } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const gmailConnected = authData.gmailConnected;
  const gmailEmail = authData.gmailEmail;

  const { data: savedJobsCountData } = useSavedJobsList(
    {
      page: 1,
      limit: 1,
    },
    {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnMount: true,
    }
  );

  const savedCount =
    savedJobsCountData?.paginationMeta?.total ?? savedJobsCountData?.data?.pagination?.total ?? 0;

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
      savedCount={savedCount}
      returnToAutoApply={returnToAutoApply}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onGoAutoApply={() => (window.location.href = '/dashboard/auto-apply')}
    />
  );
}
