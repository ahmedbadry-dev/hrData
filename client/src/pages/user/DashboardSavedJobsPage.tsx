import { useState } from 'react';
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
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSavedJobsList({
    limit: ITEMS_PER_PAGE,
    page,
  });

  const savedJobs = data?.data?.jobs.map(mapJobToSavedJob) || [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

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
      currentPage={page}
      totalPages={totalPages}
      isLoading={isLoading}
      onPageChange={setPage}
    />
  );
}
