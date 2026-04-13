import { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { UserLayout, type UserPageKey } from '@/components/user/layout';
import {
  useSavedJobsList,
  useSaveJob,
  useUnsaveJob,
  useSaveJobs,
  useUnsaveJobs,
  useJobsList,
} from '@/modules/jobs/api/hooks';
import { UseApplicationsList, UseScheduleApplication } from '@/modules/applications/api/hooks';
import { useLogoutMutation } from '@/modules/auth/api/mutations';
import { useAuth } from '@/modules/auth/api/hooks';
import type { SavedJob } from '@/components/user/sections/userData';
import type { UserJob } from '@/modules/jobs/types';

export type DashboardContextType = {
  savedJobs: SavedJob[];
  applicationsCount: number;
  sentCount: number;
  repliesCount: number;
  totalJobs: number;
  weeklySentCounts: number[];
  gmailConnected: boolean;
  gmailEmail: string | null;
  toggleSave: (job: UserJob) => void;
  saveAllVisible: (jobs: UserJob[]) => void;
  removeSavedByIndex: (index: number) => void;
  removeAllSaved: () => void;
  connectGmail: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
  startSending: (
    payload: {
      selected: SavedJob[];
      scheduleTime: string;
      delay: string;
      cv: File | null;
    },
    onSuccess: () => void,
    onError: () => void
  ) => void;
  isLoadingSaved: boolean;
};

export default function UserDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: authData, connectGmail, disconnectGmail } = useAuth();

  let activePage: UserPageKey = 'home';
  if (location.pathname.includes('/dashboard/jobs')) activePage = 'search';
  else if (location.pathname.includes('/dashboard/saved-jobs')) activePage = 'saved';
  else if (location.pathname.includes('/dashboard/auto-apply')) activePage = 'auto-apply';
  else if (location.pathname.includes('/dashboard/analysis')) activePage = 'analytics';
  else if (location.pathname.includes('/dashboard/settings')) activePage = 'settings';

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const gmailConnected = authData.gmailConnected;
  const gmailEmail = authData.gmailEmail;

  const { data: savedJobsData, isLoading: isLoadingSaved } = useSavedJobsList({ limit: 100 });
  const { data: jobsData } = useJobsList({ limit: 1 });
  const { data: applicationsData } = UseApplicationsList({ limit: 100 });
  const saveJobMutation = useSaveJob();
  const saveJobsMutation = useSaveJobs();
  const unsaveJobMutation = useUnsaveJob();
  const unsaveJobsMutation = useUnsaveJobs();
  const scheduleApplicationMutation = UseScheduleApplication();
  const logoutMutation = useLogoutMutation();

  const applications = applicationsData?.data?.applications || [];
  const applicationsCount = applications.length;
  const sentCount = applications.filter((a: { status: string }) =>
    ['SENT', 'EMAIL_SENT', 'EMAIL_OPENED'].includes(a.status)
  ).length;
  const repliesCount = applications.filter(
    (a: { status: string }) => a.status === 'REPLIED'
  ).length;
  const totalJobs = jobsData?.data?.pagination?.total ?? 0;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklySentCounts = Array(7).fill(0);
  applications.forEach((app: { createdAt?: string; status?: string }) => {
    if (!app.createdAt) return;
    const appDate = new Date(app.createdAt);
    if (appDate >= startOfWeek && appDate <= today) {
      const idx = appDate.getDay();
      if (app.status && ['SENT', 'EMAIL_SENT', 'EMAIL_OPENED'].includes(app.status)) {
        weeklySentCounts[idx] = (weeklySentCounts[idx] || 0) + 1;
      }
    }
  });

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

  const startSending = (
    payload: {
      selected: SavedJob[];
      scheduleTime: string;
      delay: string;
      cv: File | null;
    },
    onSuccess: () => void,
    onError: () => void
  ) => {
    const jobIds = payload.selected.map((job) => job.jobId).filter((id): id is string => !!id);

    if (jobIds.length === 0) {
      alert('لا توجد وظائف محددة');
      return;
    }

    if (!payload.cv) {
      alert('يرجى رفع سيرة ذاتية');
      return;
    }

    const scheduleTimeToIso = (scheduleTime: string): string => {
      if (scheduleTime === 'immediately' || scheduleTime === 'now') return 'immediately';

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();

      if (scheduleTime === 'tomorrow8am') {
        return new Date(currentYear, currentMonth, currentDay + 1, 8, 0, 0).toISOString();
      }
      if (scheduleTime === 'test10s') return new Date(now.getTime() + 10 * 1000).toISOString();
      if (scheduleTime === 'test1m') return new Date(now.getTime() + 60 * 1000).toISOString();
      if (scheduleTime === 'test5m') return new Date(now.getTime() + 5 * 60 * 1000).toISOString();

      const match = scheduleTime.match(/^(\d{1,2})(am|pm)$/);
      if (match) {
        let hours = parseInt(match[1], 10);
        const period = match[2];
        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        const scheduled = new Date(currentYear, currentMonth, currentDay, hours, 0, 0);
        if (scheduled.getTime() <= now.getTime()) scheduled.setDate(scheduled.getDate() + 1);
        return scheduled.toISOString();
      }

      return scheduleTime;
    };

    const sendTime = scheduleTimeToIso(payload.scheduleTime);
    const delayBetweenEmails = parseInt(payload.delay, 10) * 1000;

    console.log(`📤 Client scheduleTime mapping: "${payload.scheduleTime}" → "${sendTime}"`);

    scheduleApplicationMutation.mutate(
      { jobIds, sendTime, delayBetweenEmails, cv: payload.cv! },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: (error: unknown) => {
          alert('حدث خطأ في جدولة التقديم');
          console.error(error);
          onError();
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
    savedJobs: savedJobs || [],
    applicationsCount: applicationsCount || 0,
    sentCount: sentCount || 0,
    repliesCount: repliesCount || 0,
    totalJobs: totalJobs || 0,
    weeklySentCounts,
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
