import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import { UserAutoApplySection } from '@/components/user/sections';
import type { SavedJob } from '@/components/user/sections/userData';
import { useAuth } from '@/modules/auth/api/hooks';
import { useEligibleSavedJobsList } from '@/modules/jobs/api/hooks';
import { useApplicationsQuota, useScheduleApplication } from '@/modules/applications/api/hooks';
import type { ScheduleApplicationsResponse } from '@/modules/applications/types';
import { getErrorStatus, mapError } from '@/lib/error-mapper';

const AUTO_APPLY_LIMIT = 100;

const mapSavedJob = (job: {
  id: string;
  companyName: string;
  title: string;
  category: string | null;
  location: string | null;
  postedAt: string | null;
  hrEmail: string | null;
  description: string | null;
  experience: string | null;
  languageRequirement: string | null;
  qualification?: string | null;
  specialization?: string | null;
  previousFailedStatus?: 'FAILED';
}): SavedJob => ({
  page: 'dashboard',
  company: job.companyName,
  role: job.title,
  major: job.category || '',
  city: job.location || '',
  date: job.postedAt || '',
  email: job.hrEmail || '',
  description: job.description,
  experience: job.experience,
  languageRequirement: job.languageRequirement,
  qualification: job.qualification,
  specialization: job.specialization,
  timestamp: job.postedAt || new Date().toISOString(),
  jobId: job.id,
  hrEmail: job.hrEmail || undefined,
  previousFailedStatus: job.previousFailedStatus,
});

export default function DashboardAutoApplyPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: authData } = useAuth();

  const { data: eligibleSavedJobsData } = useEligibleSavedJobsList(
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
  const { data: quotaResponse, isLoading: isQuotaLoading } = useApplicationsQuota({
    enabled: authData.isAuthenticated,
    refetchOnMount: true,
  });

  const quota = quotaResponse?.data ?? null;

  const savedJobs = useMemo(
    () =>
      (eligibleSavedJobsData?.data?.jobs || []).map((job) =>
        mapSavedJob({
          id: job.id,
          companyName: job.companyName,
          title: job.title,
          category: job.category,
          location: job.location,
          postedAt: job.postedAt,
          hrEmail: job.hrEmail,
          description: job.description,
          experience: job.experience,
          languageRequirement: job.languageRequirement,
          qualification: job.qualification,
          specialization: job.specialization,
          previousFailedStatus: job.previousFailedStatus,
        })
      ),
    [eligibleSavedJobsData?.data?.jobs]
  );

  const startSending = (
    payload: {
      selected: SavedJob[];
      scheduleTime: string;
      delay: string;
      cv: File | null;
      body: string;
    },
    onSuccess: (result: ScheduleApplicationsResponse) => void,
    onError: () => void
  ) => {
    const jobIds = payload.selected.map((job) => job.jobId).filter((id): id is string => !!id);

    if (jobIds.length === 0) {
      showToast({ message: 'لا توجد وظائف محددة', type: 'error' });
      return;
    }

    if (!payload.cv) {
      showToast({ message: 'يرجى رفع سيرة ذاتية', type: 'error' });
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
        emailBody: payload.body,
      },
      {
        onSuccess: (response) => {
          const result = response.data;

          if (!result) {
            showToast({
              message: 'تمت الجدولة لكن تعذر قراءة تفاصيل الحصة اليومية.',
              type: 'info',
            });
            onError();
            return;
          }

          if (result.cappedByLimit && result.skippedCount > 0) {
            showToast({
              message: `تم جدولة ${result.scheduledCount} وظيفة فقط. تم تجاوز ${result.skippedCount} بسبب الحد اليومي.`,
              type: 'warning',
            });
          }

          onSuccess(result);
        },
        onError: (error: unknown) => {
          const status = getErrorStatus(error);
          const message = mapError(error);

          if (status === 429) {
            showToast({ message, type: 'error' });
          } else {
            showToast({ message: message || 'حدث خطأ في جدولة التقديم', type: 'error' });
          }

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
      quota={quota}
      isQuotaLoading={isQuotaLoading}
      onGoToSettings={() => navigate('/dashboard/settings', { state: { returnToAutoApply: true } })}
      onGoSavedJobs={() => navigate('/dashboard/saved-jobs')}
      onStartSending={startSending}
      onGoAnalytics={() => (window.location.href = '/dashboard/analysis')}
      onGoHome={() => navigate('/dashboard')}
    />
  );
}
