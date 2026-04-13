import { useState } from 'react';
import { UserSearchSection } from '@/components/user/sections';
import { useJobsListQuery } from '@/modules/jobs/api/hooks';
import type { Job, UserJob } from '@/modules/jobs/types';

const ITEMS_PER_PAGE = 10;

const mapJobToUserJob = (job: Job): UserJob => ({
  company: job.companyName,
  role: job.title,
  major: job.category || '',
  city: job.location || '',
  date: job.postedAt || '',
  email: job.hrEmail || '',
});

export default function PublicJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [country, setCountry] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data } = useJobsListQuery({
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

  return (
    <UserSearchSection
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onSearch={search}
      jobs={jobs}
      hasNextPage={jobs.length === ITEMS_PER_PAGE}
      isLoadingMore={false}
      hasSearched={hasSearched}
      selectedCard={null}
      onSelectCard={() => {}}
      onLoadMore={loadMore}
      savedJobs={[]}
      onToggleSave={() => {}}
      onSaveAllVisible={() => {}}
      country={country}
      onCountryChange={setCountry}
      timeFilter={timeFilter}
      onTimeFilterChange={setTimeFilter}
      showSaveButtons={false}
    />
  );
}
