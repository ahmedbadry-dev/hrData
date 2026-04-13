import { useOutletContext } from 'react-router-dom';
import { UserSavedJobsSection } from '@/components/user/sections';
import { useSavedJobsList, useUnsaveJob } from '@/modules/jobs/api/hooks';
import type { DashboardContextType } from './UserDashboardLayout';
import type { SavedJob } from '@/components/user/sections/userData';

const ITEMS_PER_PAGE = 10;

const mapJobToSavedJob = (job: any): SavedJob => ({
  page: 'dashboard',
  company: job.companyName,
  role: job.title,
  major: job.category || '',
  city: job.location || '',
  date: job.postedAt || '',
  email: job.hrEmail || '',
  timestamp: job.postedAt || new Date().toISOString(),
  jobId: job.id,
});

export default function DashboardSavedJobsPage() {
  const { removeAllSaved } = useOutletContext<DashboardContextType>();
  const unsaveJob = useUnsaveJob();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSavedJobsList({
    limit: ITEMS_PER_PAGE,
  });

  const savedJobs = data?.pages.flatMap((page: any) => page.data.jobs.map(mapJobToSavedJob)) || [];

  const handleRemoveByIndex = (index: number) => {
    const job = savedJobs[index];
    if (job?.jobId) {
      unsaveJob.mutate(job.jobId);
    }
  };

  return (
    <UserSavedJobsSection
      savedJobs={savedJobs}
      onRemoveByIndex={handleRemoveByIndex}
      onRemoveAll={removeAllSaved}
      hasNextPage={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={fetchNextPage}
    />
  );
}
