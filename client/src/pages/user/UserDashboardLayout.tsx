import { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { UserLayout, type UserPageKey } from '@/components/user/layout';
import {
  useSavedJobs,
  useSaveJob,
  useUnsaveJob,
  useSaveJobs,
  useUnsaveJobs,
} from '@/modules/jobs/api/hooks';
import { UseScheduleApplication } from '@/modules/applications/api/hooks';
import { useLogoutMutation } from '@/modules/auth/api/mutations';
import { useAuth } from '@/modules/auth/api/hooks';
import type { SavedJob } from '@/components/user/sections/userData';
import type { UserJob } from '@/modules/jobs/types';

export type DashboardContextType = {
  savedJobs: SavedJob[];
  gmailConnected: boolean;
  gmailEmail: string | null;
  toggleSave: (job: UserJob) => void;
  saveAllVisible: (jobs: UserJob[]) => void;
  removeSavedByIndex: (index: number) => void;
  removeAllSaved: () => void;
  connectGmail: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
  startSending: (payload: {
    selected: SavedJob[];
    scheduleTime: string;
    delay: string;
    cvId: string | null;
  }) => void;
  isLoadingSaved: boolean;
};

export default function UserDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: authData, connectGmail, disconnectGmail } = useAuth();

  let activePage: UserPageKey = 'home';
  if (location.pathname.includes('/dashboard/jobs')) activePage = 'search';
  else if (location.pathname.includes('/dashboard/saved-jobs')) activePage = 'saved';
  else if (location.pathname.includes('/dashboard/applications')) activePage = 'applications';
  else if (location.pathname.includes('/dashboard/auto-apply')) activePage = 'auto-apply';
  else if (location.pathname.includes('/dashboard/analysis')) activePage = 'analytics';
  else if (location.pathname.includes('/dashboard/settings')) activePage = 'settings';

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const gmailConnected = authData.gmailConnected;
  const gmailEmail = authData.gmailEmail;

  const { data: savedJobsData, isLoading: isLoadingSaved } = useSavedJobs({ limit: 100 });
  const saveJobMutation = useSaveJob();
  const saveJobsMutation = useSaveJobs();
  const unsaveJobMutation = useUnsaveJob();
  const unsaveJobsMutation = useUnsaveJobs();
  const scheduleApplicationMutation = UseScheduleApplication();
  const logoutMutation = useLogoutMutation();

  const savedJobs: SavedJob[] = (savedJobsData?.data?.jobs || []).map((job) => ({
    page: 'dashboard',
    company: job.companyName,
    role: job.title,
    email: job.hrEmail || '',
    major: job.category || '',
    city: job.location || '',
    date: job.postedAt || '',
    timestamp: job.postedAt || new Date().toISOString(),
    jobId: job.id,
  }));

  const toggleSave = useCallback(
    (job: UserJob) => {
      const jobId = job.jobId;
      if (!jobId) return;

      const exists = savedJobs.some((s) => s.jobId === jobId);
      if (exists) {
        unsaveJobMutation.mutate(jobId);
      } else {
        saveJobMutation.mutate(jobId);
      }
    },
    [savedJobs, saveJobMutation, unsaveJobMutation]
  );

  const saveAllVisible = useCallback(
    (visibleJobs: UserJob[]) => {
      const existingIds = new Set(savedJobs.map((s) => s.jobId));
      const toSave = visibleJobs
        .filter((job) => job.jobId && !existingIds.has(job.jobId))
        .map((job) => job.jobId as string);

      if (toSave.length === 0) {
        return;
      }

      saveJobsMutation.mutate(toSave);
    },
    [savedJobs, saveJobsMutation]
  );

  const removeSavedByIndex = useCallback(
    (index: number) => {
      const job = savedJobs[index];
      if (job?.jobId) {
        unsaveJobMutation.mutate(job.jobId);
      }
    },
    [savedJobs, unsaveJobMutation]
  );

  const removeAllSaved = useCallback(() => {
    const jobIds = savedJobs
      .map((job) => job.jobId)
      .filter((jobId): jobId is string => Boolean(jobId));

    if (jobIds.length === 0) {
      return;
    }

    unsaveJobsMutation.mutate(jobIds);
  }, [savedJobs, unsaveJobsMutation]);

  const handleDisconnectGmail = async () => {
    if (!window.confirm('هل أنت متأكد من فصل الاتصال؟')) return;
    await disconnectGmail();
  };

  const startSending = (payload: {
    selected: SavedJob[];
    scheduleTime: string;
    delay: string;
    cvId: string | null;
  }) => {
    const jobIds = payload.selected.map((job) => job.jobId).filter((id): id is string => !!id);

    if (jobIds.length === 0) {
      alert('لا توجد وظائف محددة');
      return;
    }

    if (!payload.cvId) {
      alert('يرجى رفع سيرة ذاتية');
      return;
    }

    const sendTime = payload.scheduleTime === 'now' ? 'immediately' : payload.scheduleTime;
    const delayBetweenEmails = parseInt(payload.delay, 10) * 1000;

    scheduleApplicationMutation.mutate(
      { jobIds, sendTime, delayBetweenEmails, cvId: payload.cvId! },
      {
        onSuccess: () => {
          navigate('/dashboard/applications');
        },
        onError: (error: unknown) => {
          alert('حدث خطأ في جدولة التقديم');
          console.error(error);
        },
      }
    );
  };

  const handleNavigate = (page: UserPageKey) => {
    setMobileSidebarOpen(false);
    switch (page) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'search':
        navigate('/dashboard/jobs');
        break;
      case 'saved':
        navigate('/dashboard/saved-jobs');
        break;
      case 'applications':
        navigate('/dashboard/applications');
        break;
      case 'auto-apply':
        navigate('/dashboard/auto-apply');
        break;
      case 'analytics':
        navigate('/dashboard/analysis');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
    }
  };

  const contextValue: DashboardContextType = {
    savedJobs,
    gmailConnected,
    gmailEmail,
    toggleSave,
    saveAllVisible,
    removeSavedByIndex,
    removeAllSaved,
    connectGmail,
    disconnectGmail: handleDisconnectGmail,
    startSending,
    isLoadingSaved,
  };

  return (
    <UserLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      mobileSidebarOpen={mobileSidebarOpen}
      onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      onCloseSidebar={() => setMobileSidebarOpen(false)}
      savedCount={savedJobs.length}
      onLogout={() => logoutMutation.mutate()}
    >
      <Outlet context={contextValue} />
    </UserLayout>
  );
}
