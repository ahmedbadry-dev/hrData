import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserSearchSection } from '@/components/user/sections';
import { useJobsList } from '@/modules/jobs/api/hooks';
import type { DashboardContextType } from './UserDashboardLayout';
import type { Job, UserJob } from '@/modules/jobs/types';

const ITEMS_PER_PAGE = 10;

const mapJobToUserJob = (job: Job): UserJob & { jobId: string } => ({
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
  const [country, setCountry] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data } = useJobsList({
    page,
    limit: ITEMS_PER_PAGE,
    search: searchQuery || undefined,
    location: country !== 'all' ? country : undefined,
    dateFilter: timeFilter !== 'all' ? timeFilter : undefined,
  });

  const jobs: UserJob[] = (data?.data?.jobs || []).map(mapJobToUserJob);

  const search = () => {
    setHasSearched(true);
    setPage(1);
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
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
      visibleCount={jobs.length}
      hasSearched={hasSearched}
      selectedCard={null}
      onSelectCard={() => {}}
      onLoadMore={loadMore}
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
