import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAutoApplySection } from '@/components/user/sections';
import type { SavedJob } from '@/components/user/sections/userData';
import { useAuth } from '@/modules/auth/api/hooks';
import { useSavedJobsList } from '@/modules/jobs/api/hooks';
import { useScheduleApplication } from '@/modules/applications/api/hooks';

const AUTO_APPLY_LIMIT = 100;

const mapSavedJob = (job: {
  id: string;
  companyName: string;
  title: string;
  category: string | null;
  location: string | null;
  postedAt: string | null;
  hrEmail: string | null;
}): SavedJob => ({
  page: 'dashboard',
  company: job.companyName,
  role: job.title,
  major: job.category || '',
  city: job.location || '',
  date: job.postedAt || '',
  email: job.hrEmail || '',
  timestamp: job.postedAt || new Date().toISOString(),
  jobId: job.id,
  hrEmail: job.hrEmail || undefined,
});

export default function DashboardAutoApplyPage() {
  const navigate = useNavigate();
  const { data: authData } = useAuth();

  const { data: savedJobsData } = useSavedJobsList(
    {
      page: 1,
      limit: AUTO_APPLY_LIMIT,
    },
    {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnMount: true,
    }
  );

  const scheduleApplicationMutation = useScheduleApplication();

  const savedJobs = useMemo(
    () =>
      (savedJobsData?.data?.jobs || []).map((job) =>
        mapSavedJob({
          id: job.id,
          companyName: job.companyName,
          title: job.title,
          category: job.category,
          location: job.location,
          postedAt: job.postedAt,
          hrEmail: job.hrEmail,
        })
      ),
    [savedJobsData?.data?.jobs]
  );

  const startSending = (
    payload: {
      selected: SavedJob[];
      scheduleTime: string;
      delay: string;
      cv: File | null;
      body: string;
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

    scheduleApplicationMutation.mutate(
      {
        jobIds,
        sendTime,
        delayBetweenEmails,
        cv: payload.cv,
      },
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

  return (
    <UserAutoApplySection
      savedJobs={savedJobs}
      gmailConnected={authData.gmailConnected}
      gmailEmail={authData.gmailEmail}
      onGoToSettings={() => navigate('/dashboard/settings', { state: { returnToAutoApply: true } })}
      onGoSavedJobs={() => navigate('/dashboard/saved-jobs')}
      onStartSending={startSending}
      onGoAnalytics={() => (window.location.href = '/dashboard/analysis')}
      onGoHome={() => navigate('/dashboard')}
    />
  );
}
