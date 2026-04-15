import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserSearchSection } from '@/components/user/sections';
import { useJobsList } from '@/modules/jobs/api/hooks';
import type { DashboardContextType } from './UserDashboardLayout';
import type { UserJob } from '@/modules/jobs/types';

const ITEMS_PER_PAGE = 10;

const mapJobToUserJob = (job: any): UserJob & { jobId: string } => ({
  company: job.companyName,
  role: job.title,
  major: job.category || '',
  city: job.location || '',
  date: job.postedAt || '',
  email: job.hrEmail || '',
  jobId: job.id,
});

export default function DashboardJobsPage() {
  const { savedJobs, toggleSave, saveAllVisible } = useOutletContext<DashboardContextType>();

  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [country, setCountry] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = {
    limit: ITEMS_PER_PAGE,
    page,
    search: searchQuery || undefined,
    location: country || undefined,
    dateFilter: timeFilter || undefined,
  };

  const { data, isLoading, isFetching } = useJobsList(queryParams, {
    enabled: hasSearched,
  });

  const isJobsLoading = isLoading || isFetching;

  const jobs: UserJob[] = data?.data?.jobs.map(mapJobToUserJob) || [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const search = () => {
    setHasSearched(true);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSaveAllVisible = () => {
    saveAllVisible(jobs);
  };

  return (
    <UserSearchSection
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onSearch={search}
      jobs={jobs}
      currentPage={page}
      totalPages={totalPages}
      isLoading={isJobsLoading}
      hasSearched={hasSearched}
      selectedCard={null}
      onSelectCard={() => {}}
      onPageChange={handlePageChange}
      savedJobs={savedJobs}
      onToggleSave={toggleSave}
      onSaveAllVisible={handleSaveAllVisible}
      country={country}
      onCountryChange={setCountry}
      timeFilter={timeFilter}
      onTimeFilterChange={setTimeFilter}
    />
  );
}
