import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserSearchSection } from '@/components/user/sections';
import { mockJobs } from '@/components/user/sections/userData';
import type { DashboardContextType } from './UserDashboardLayout';

const ITEMS_PER_PAGE = 10;

export default function DashboardJobsPage() {
  const { savedJobs, toggleSave, saveAllVisible } = useOutletContext<DashboardContextType>();

  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [country, setCountry] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(0);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const visibleJobs = useMemo(() => mockJobs.slice(0, visibleCount), [visibleCount]);

  const search = () => {
    setHasSearched(true);
    setVisibleCount(Math.min(ITEMS_PER_PAGE, mockJobs.length));
    setSelectedCard(null);
  };

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, mockJobs.length));
  };

  const handleSaveAllVisible = () => {
    saveAllVisible(visibleJobs);
  };

  return (
    <UserSearchSection
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onSearch={search}
      jobs={mockJobs}
      visibleCount={visibleCount}
      hasSearched={hasSearched}
      selectedCard={selectedCard}
      onSelectCard={(key) => setSelectedCard((prev) => (prev === key ? null : key))}
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
