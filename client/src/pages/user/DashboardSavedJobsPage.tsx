import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/common';
import { UserSavedJobsSection } from '@/components/user/sections';
import { useSavedJobsList, useUnsaveJob, useUnsaveJobs } from '@/modules/jobs/api/hooks';
import { jobsQueryKeys } from '@/modules/jobs/api/jobs.query-keys';
import type { SavedJob } from '@/components/user/sections/userData';
import type { ApiResponse } from '@/services/api';
import type { PaginatedJobs } from '@/modules/jobs/api/jobs.service';

const ITEMS_PER_PAGE = 10;
const SAVED_STALE_TIME_MS = 2 * 60 * 1000;
const SAVED_GC_TIME_MS = 5 * 60 * 1000;

type SavedJobsApiResponse = ApiResponse<PaginatedJobs>;

type UnsaveOneContext = {
  previous?: SavedJobsApiResponse;
  wasLastItemOnPage: boolean;
  previousPage: number;
};

const mapJobToSavedJob = (job: PaginatedJobs['jobs'][number]): SavedJob => ({
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

const removeJobFromSavedCache = (
  current: SavedJobsApiResponse | undefined,
  jobId: string,
  currentPage: number,
  limit: number
): { next: SavedJobsApiResponse | undefined; wasLastItemOnPage: boolean } => {
  if (!current?.data?.jobs) {
    return { next: current, wasLastItemOnPage: false };
  }

  const nextJobs = current.data.jobs.filter((job) => job.id !== jobId);
  const wasLastItemOnPage = current.data.jobs.length === 1;

  const previousMeta = current.paginationMeta ?? current.data.pagination;
  const previousTotal = previousMeta?.total ?? current.data.jobs.length;
  const nextTotal = Math.max(previousTotal - 1, 0);
  const nextTotalPages = Math.max(Math.ceil(nextTotal / limit), 1);

  const nextPagination = {
    ...(current.data.pagination ?? {}),
    page: currentPage,
    limit,
    total: nextTotal,
    totalPages: nextTotalPages,
    hasNextPage: currentPage < nextTotalPages,
    hasPreviousPage: currentPage > 1 && nextTotal > 0,
  };

  return {
    next: {
      ...current,
      paginationMeta: {
        ...previousMeta,
        page: currentPage,
        limit,
        total: nextTotal,
        totalPages: nextTotalPages,
        hasNextPage: currentPage < nextTotalPages,
        hasPreviousPage: currentPage > 1 && nextTotal > 0,
      },
      data: {
        ...current.data,
        jobs: nextJobs,
        pagination: nextPagination,
      },
    },
    wasLastItemOnPage,
  };
};

export default function DashboardSavedJobsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [hasClearedAll, setHasClearedAll] = useState(false);

  const queryParams = useMemo(
    () => ({
      limit: ITEMS_PER_PAGE,
      page,
    }),
    [page]
  );

  const currentSavedJobsKey = useMemo(() => jobsQueryKeys.saved(queryParams), [queryParams]);
  const firstPageSavedJobsKey = useMemo(
    () => jobsQueryKeys.saved({ page: 1, limit: ITEMS_PER_PAGE }),
    []
  );

  const { data, isLoading, isFetching, isError } = useSavedJobsList(queryParams, {
    enabled: !hasClearedAll,
    staleTime: SAVED_STALE_TIME_MS,
    gcTime: SAVED_GC_TIME_MS,
    refetchOnMount: true,
  });

  const unsaveOneMutation = useUnsaveJob({
    onMutate: async (jobId): Promise<UnsaveOneContext> => {
      await queryClient.cancelQueries({ queryKey: currentSavedJobsKey });

      const previous = queryClient.getQueryData<SavedJobsApiResponse>(currentSavedJobsKey);
      const { next, wasLastItemOnPage } = removeJobFromSavedCache(
        previous,
        jobId,
        page,
        ITEMS_PER_PAGE
      );

      if (next) {
        queryClient.setQueryData(currentSavedJobsKey, next);
      }

      return {
        previous,
        wasLastItemOnPage,
        previousPage: page,
      };
    },
    onError: (_error, _jobId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(currentSavedJobsKey, context.previous);
      }

      alert('تعذر إزالة الوظيفة المحفوظة. حاول مرة أخرى.');
    },
    onSuccess: (_result, _jobId, context) => {
      void queryClient.invalidateQueries({
        queryKey: firstPageSavedJobsKey,
        refetchType: 'none',
      });

      if (context?.wasLastItemOnPage && context.previousPage > 1) {
        setPage(context.previousPage - 1);
        void queryClient.invalidateQueries({ queryKey: jobsQueryKeys.savedAll });
      }
    },
  });

  const unsaveAllMutation = useUnsaveJobs({
    onError: () => {
      alert('تعذر إزالة جميع الوظائف المحفوظة. حاول مرة أخرى.');
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: jobsQueryKeys.savedAll });
      void queryClient.invalidateQueries({ queryKey: jobsQueryKeys.all });
      setPage(1);
      setHasClearedAll(true);
    },
  });

  const savedJobs = useMemo(
    () => (hasClearedAll ? [] : (data?.data?.jobs ?? []).map(mapJobToSavedJob)),
    [data?.data?.jobs, hasClearedAll]
  );

  const paginationMeta = data?.paginationMeta ?? data?.data?.pagination;
  const totalPages = paginationMeta?.totalPages || 1;

  const handleRemoveByIndex = (index: number) => {
    const job = savedJobs[index];
    if (!job?.jobId) {
      return;
    }

    unsaveOneMutation.mutate(job.jobId);
  };

  const handleRemoveAll = () => {
    if (savedJobs.length === 0) {
      return;
    }

    unsaveAllMutation.mutate(undefined);
  };

  if (isError) {
    return (
      <section>
        <EmptyState
          symbol="!"
          title="تعذر تحميل الوظائف المحفوظة"
          description="يرجى إعادة المحاولة بعد قليل"
        />
      </section>
    );
  }

  return (
    <UserSavedJobsSection
      savedJobs={savedJobs}
      onRemoveByIndex={handleRemoveByIndex}
      onRemoveAll={handleRemoveAll}
      currentPage={page}
      totalPages={totalPages}
      isLoading={isLoading || isFetching || unsaveOneMutation.isPending || unsaveAllMutation.isPending}
      onPageChange={setPage}
    />
  );
}
