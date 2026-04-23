import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/common';
import { UserHomeSection } from '@/components/user/sections';
import { jobsService } from '@/modules/jobs/api/jobs.service';
import { jobsQueryKeys } from '@/modules/jobs/api/jobs.query-keys';
import { fetchApplicationsList, fetchApplicationsStats } from '@/modules/applications/api/applications.service';
import { applicationsQueryKeys } from '@/modules/applications/api/applications.query-keys';
import type { Application } from '@/modules/applications/types';

const STATS_QUERY_OPTIONS = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
} as const;

const WEEKLY_QUERY_OPTIONS = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: true,
  refetchOnWindowFocus: false,
} as const;

const buildCurrentWeekActivity = (applications: Application[]): number[] => {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const dayToIndex = new Map<number, number>([
    [6, 0],
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
  ]);

  const now = new Date();
  const daysSinceSaturday = (now.getDay() + 1) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysSinceSaturday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  for (const application of applications) {
    const dateSource = application.sentAt ?? application.createdAt;
    if (!dateSource) {
      continue;
    }

    const applicationDate = new Date(dateSource);
    if (Number.isNaN(applicationDate.getTime())) {
      continue;
    }

    if (applicationDate < startOfWeek || applicationDate >= endOfWeek) {
      continue;
    }

    const targetIndex = dayToIndex.get(applicationDate.getDay());
    if (targetIndex === undefined) {
      continue;
    }

    counts[targetIndex] += 1;
  }

  return counts;
};

export default function DashboardHomePage() {
  const [totalJobsQuery, savedJobsQuery, applicationsCountQuery, statsQuery] = useQueries({
    queries: [
      {
        queryKey: jobsQueryKeys.list({ page: 1, limit: 1 }),
        queryFn: () => jobsService.fetchJobs({ page: 1, limit: 1 }),
        ...STATS_QUERY_OPTIONS,
      },
      {
        queryKey: jobsQueryKeys.saved({ page: 1, limit: 1 }),
        queryFn: () => jobsService.fetchSavedJobs({ page: 1, limit: 1 }),
        ...STATS_QUERY_OPTIONS,
      },
      {
        queryKey: applicationsQueryKeys.list({ page: 1, limit: 1 }),
        queryFn: () => fetchApplicationsList({ page: 1, limit: 1 }),
        ...STATS_QUERY_OPTIONS,
      },
      {
        queryKey: [...applicationsQueryKeys.all, 'stats'],
        queryFn: () => fetchApplicationsStats(),
        ...STATS_QUERY_OPTIONS,
      },
    ],
  });

  const weeklyActivityQuery = useQuery({
    queryKey: applicationsQueryKeys.weeklyActivity,
    queryFn: () => fetchApplicationsList({ page: 1, limit: 100 }),
    ...WEEKLY_QUERY_OPTIONS,
  });

  const hasError =
    totalJobsQuery.isError ||
    savedJobsQuery.isError ||
    applicationsCountQuery.isError ||
    statsQuery.isError ||
    weeklyActivityQuery.isError;

  const totalJobs =
    totalJobsQuery.data?.paginationMeta?.total ?? totalJobsQuery.data?.data?.pagination?.total ?? 0;

  const savedJobsCount =
    savedJobsQuery.data?.paginationMeta?.total ?? savedJobsQuery.data?.data?.pagination?.total ?? 0;

  const applicationsCount =
    applicationsCountQuery.data?.paginationMeta?.total ??
    applicationsCountQuery.data?.data?.pagination?.total ??
    0;

  const stats = statsQuery.data?.data;
  const successRate =
    stats && stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;

  const weeklyData = useMemo(
    () => buildCurrentWeekActivity(weeklyActivityQuery.data?.data?.applications ?? []),
    [weeklyActivityQuery.data?.data?.applications]
  );

  const isStatsLoading =
    totalJobsQuery.isLoading ||
    totalJobsQuery.isFetching ||
    savedJobsQuery.isLoading ||
    savedJobsQuery.isFetching ||
    applicationsCountQuery.isLoading ||
    applicationsCountQuery.isFetching ||
    statsQuery.isLoading ||
    statsQuery.isFetching;

  const isWeeklyLoading = weeklyActivityQuery.isLoading || weeklyActivityQuery.isFetching;

  if (hasError) {
    return (
      <section>
        <EmptyState
          symbol="!"
          title="تعذر تحميل بيانات لوحة التحكم حالياً"
          description="يرجى إعادة المحاولة بعد قليل"
        />
      </section>
    );
  }

  return (
    <UserHomeSection
      savedCount={savedJobsCount}
      applicationsCount={applicationsCount}
      repliesCount={successRate}
      totalJobs={totalJobs}
      weeklyData={weeklyData}
      isStatsLoading={isStatsLoading}
      isWeeklyLoading={isWeeklyLoading}
    />
  );
}
