import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserSearchSection } from '@/components/user/sections';
import {
  useJobsList,
  useSaveJob,
  useSaveJobs,
  useUnsaveJob,
  useUnsaveJobs,
} from '@/modules/jobs/api/hooks';
import { jobsService, type Job, type PaginatedJobs } from '@/modules/jobs/api/jobs.service';
import { jobsQueryKeys } from '@/modules/jobs/api/jobs.query-keys';
import type { UserJob } from '@/modules/jobs/types';
import type { SavedJob } from '@/components/user/sections/userData';
import type { ApiResponse } from '@/services/api';

const ITEMS_PER_PAGE = 10;
const JOBS_STALE_TIME_MS = 5 * 60 * 1000;
const JOBS_GC_TIME_MS = 10 * 60 * 1000;

type JobsListApiResponse = ApiResponse<PaginatedJobs>;

type JobsMutationContext = {
  previous?: JobsListApiResponse;
};

const mapJobToUserJob = (job: Job): UserJob & { jobId: string } => ({
  company: job.companyName,
  role: job.title,
  major: job.category || '',
  city: job.location || '',
  date: job.postedAt || '',
  email: job.hrEmail || '',
  jobId: job.id,
  isSaved: Boolean(job.isSaved),
});

const mapUserJobToSavedJob = (job: UserJob): SavedJob => ({
  page: 'dashboard',
  company: job.company,
  role: job.role,
  major: job.major,
  city: job.city,
  date: job.date,
  email: job.email,
  timestamp: job.date || new Date().toISOString(),
  jobId: job.jobId,
  hrEmail: job.hrEmail,
});

const updateJobsInCache = (
  current: JobsListApiResponse | undefined,
  updater: (jobs: Job[]) => Job[]
): JobsListApiResponse | undefined => {
  if (!current?.data?.jobs) {
    return current;
  }

  return {
    ...current,
    data: {
      ...current.data,
      jobs: updater(current.data.jobs),
    },
  };
};

export default function DashboardJobsPage() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [country, setCountry] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    keyword: '',
    location: '',
    dateFilter: '',
  });
  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      limit: ITEMS_PER_PAGE,
      page,
      keyword: appliedFilters.keyword || undefined,
      location: appliedFilters.location || undefined,
      dateFilter: appliedFilters.dateFilter || undefined,
    }),
    [appliedFilters.dateFilter, appliedFilters.keyword, appliedFilters.location, page]
  );

  const jobsQueryKey = useMemo(() => jobsQueryKeys.list(queryParams), [queryParams]);

  const { data, isLoading, isFetching, isError } = useJobsList(queryParams, {
    enabled: searchTriggered,
    staleTime: JOBS_STALE_TIME_MS,
    gcTime: JOBS_GC_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const saveJobMutation = useSaveJob({
    onMutate: async (jobId): Promise<JobsMutationContext> => {
      await queryClient.cancelQueries({ queryKey: jobsQueryKey });
      const previous = queryClient.getQueryData<JobsListApiResponse>(jobsQueryKey);

      queryClient.setQueryData<JobsListApiResponse>(jobsQueryKey, (current) =>
        updateJobsInCache(current, (jobs) =>
          jobs.map((job) => (job.id === jobId ? { ...job, isSaved: true } : job))
        )
      );

      return { previous };
    },
    onError: (_error, _jobId, onMutateResult) => {
      const context = onMutateResult as JobsMutationContext | undefined;

      if (context?.previous) {
        queryClient.setQueryData(jobsQueryKey, context.previous);
      }

      alert('تعذر تحديث حالة الحفظ. حاول مرة أخرى.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.savedAll });
    },
  });

  const unsaveJobMutation = useUnsaveJob({
    onMutate: async (jobId): Promise<JobsMutationContext> => {
      await queryClient.cancelQueries({ queryKey: jobsQueryKey });
      const previous = queryClient.getQueryData<JobsListApiResponse>(jobsQueryKey);

      queryClient.setQueryData<JobsListApiResponse>(jobsQueryKey, (current) =>
        updateJobsInCache(current, (jobs) =>
          jobs.map((job) => (job.id === jobId ? { ...job, isSaved: false } : job))
        )
      );

      return { previous };
    },
    onError: (_error, _jobId, onMutateResult) => {
      const context = onMutateResult as JobsMutationContext | undefined;

      if (context?.previous) {
        queryClient.setQueryData(jobsQueryKey, context.previous);
      }

      alert('تعذر تحديث حالة الحفظ. حاول مرة أخرى.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.savedAll });
    },
  });

  const saveJobsMutation = useSaveJobs({
    onMutate: async (jobIds): Promise<JobsMutationContext> => {
      await queryClient.cancelQueries({ queryKey: jobsQueryKey });
      const previous = queryClient.getQueryData<JobsListApiResponse>(jobsQueryKey);
      const targetIds = new Set(jobIds);

      queryClient.setQueryData<JobsListApiResponse>(jobsQueryKey, (current) =>
        updateJobsInCache(current, (jobs) =>
          jobs.map((job) => (targetIds.has(job.id) ? { ...job, isSaved: true } : job))
        )
      );

      return { previous };
    },
    onError: (_error, _jobIds, onMutateResult) => {
      const context = onMutateResult as JobsMutationContext | undefined;

      if (context?.previous) {
        queryClient.setQueryData(jobsQueryKey, context.previous);
      }

      alert('تعذر تنفيذ عملية الحفظ الجماعي. حاول مرة أخرى.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.savedAll });
    },
  });

  const unsaveJobsMutation = useUnsaveJobs({
    onMutate: async (jobIds): Promise<JobsMutationContext> => {
      await queryClient.cancelQueries({ queryKey: jobsQueryKey });
      const previous = queryClient.getQueryData<JobsListApiResponse>(jobsQueryKey);
      const targetIds = new Set(jobIds ?? []);

      queryClient.setQueryData<JobsListApiResponse>(jobsQueryKey, (current) =>
        updateJobsInCache(current, (jobs) =>
          jobs.map((job) => (targetIds.has(job.id) ? { ...job, isSaved: false } : job))
        )
      );

      return { previous };
    },
    onError: (_error, _jobIds, onMutateResult) => {
      const context = onMutateResult as JobsMutationContext | undefined;

      if (context?.previous) {
        queryClient.setQueryData(jobsQueryKey, context.previous);
      }

      alert('تعذر تنفيذ عملية الإزالة الجماعية. حاول مرة أخرى.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsQueryKeys.savedAll });
    },
  });

  const jobs: UserJob[] = useMemo(
    () => (data?.data?.jobs ?? []).map((job) => mapJobToUserJob(job)),
    [data?.data?.jobs]
  );

  const currentPageSavedJobs = useMemo(
    () => jobs.filter((job) => Boolean(job.isSaved)).map((job) => mapUserJobToSavedJob(job)),
    [jobs]
  );

  const paginationMeta = data?.paginationMeta ?? data?.data?.pagination;
  const totalPages = paginationMeta?.totalPages || 1;
  const totalJobsCount = paginationMeta?.total ?? jobs.length;
  const allSaved = jobs.length > 0 && jobs.every((job) => Boolean(job.isSaved));

  const isJobsLoading = searchTriggered && (isLoading || isFetching);
  const hasJobsError = searchTriggered && isError;

  useEffect(() => {
    if (!searchTriggered || !data || page >= totalPages) {
      return;
    }

    const nextPageParams = {
      ...queryParams,
      page: page + 1,
    };

    void queryClient.prefetchQuery({
      queryKey: jobsQueryKeys.list(nextPageParams),
      queryFn: () => jobsService.fetchJobs(nextPageParams),
      staleTime: JOBS_STALE_TIME_MS,
      gcTime: JOBS_GC_TIME_MS,
    });
  }, [data, page, queryClient, queryParams, searchTriggered, totalPages]);

  const search = () => {
    setPage(1);
    setSearchTriggered(true);
    setAppliedFilters({
      keyword: searchQuery,
      location: country,
      dateFilter: timeFilter,
    });
  };

  const handleToggleSave = (job: UserJob) => {
    if (!job.jobId) {
      return;
    }

    if (job.isSaved) {
      unsaveJobMutation.mutate(job.jobId);
      return;
    }

    saveJobMutation.mutate(job.jobId);
  };

  const handleBulkAction = () => {
    const visibleJobIds = jobs
      .map((job) => job.jobId)
      .filter((jobId): jobId is string => Boolean(jobId));

    if (visibleJobIds.length === 0) {
      return;
    }

    if (allSaved) {
      unsaveJobsMutation.mutate(visibleJobIds);
      return;
    }

    saveJobsMutation.mutate(visibleJobIds);
  };

  return (
    <UserSearchSection
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onSearch={search}
      jobs={jobs}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalJobsCount}
      isLoading={isJobsLoading}
      hasSearched={searchTriggered}
      selectedCard={selectedCard}
      onSelectCard={setSelectedCard}
      onPageChange={setPage}
      savedJobs={currentPageSavedJobs}
      onToggleSave={handleToggleSave}
      onSaveAllVisible={handleBulkAction}
      saveAllLabel={allSaved ? 'ازالة الكل' : 'حفظ الكل'}
      saveAllDisabled={
        saveJobMutation.isPending ||
        unsaveJobMutation.isPending ||
        saveJobsMutation.isPending ||
        unsaveJobsMutation.isPending ||
        jobs.length === 0
      }
      errorMessage={hasJobsError ? 'تعذر تحميل نتائج البحث. حاول مرة أخرى.' : undefined}
      country={country}
      onCountryChange={setCountry}
      timeFilter={timeFilter}
      onTimeFilterChange={setTimeFilter}
    />
  );
}
