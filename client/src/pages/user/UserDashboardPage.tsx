import { useEffect, useMemo, useState } from 'react';
import { UserLayout, type UserPageKey } from '@/components/user/layout';
import {
  UserAnalyticsSection,
  UserAutoApplySection,
  UserHomeSection,
  UserSavedJobsSection,
  UserSearchSection,
  UserSettingsSection,
} from '@/components/user/sections';
import {
  PAGE_NAME,
  getApplications,
  getSavedJobs,
  mockJobs,
  setApplications,
  setSavedJobs,
  type SavedJob,
  type UserJob,
} from '@/components/user/sections/userData';

const ITEMS_PER_PAGE = 10;

export default function UserDashboardPage() {
  const [activePage, setActivePage] = useState<UserPageKey>('home');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [savedJobs, setSavedJobsState] = useState<SavedJob[]>([]);
  const [applications, setApplicationsState] = useState(getApplications());
  const [gmailConnected, setGmailConnected] = useState(localStorage.getItem('gmailConnected') === 'true');

  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const [returnToAutoApply, setReturnToAutoApply] = useState(false);

  useEffect(() => {
    const saved = getSavedJobs().filter((j) => j.page === PAGE_NAME);
    setSavedJobsState(saved);
  }, []);

  const persistSaved = (next: SavedJob[]) => {
    const all = getSavedJobs().filter((j) => j.page !== PAGE_NAME);
    const merged = [...all, ...next];
    setSavedJobs(merged);
    setSavedJobsState(next);
  };

  const visibleJobs = useMemo(() => mockJobs.slice(0, visibleCount), [visibleCount]);

  const toggleSave = (job: UserJob) => {
    const exists = savedJobs.some((s) => s.company === job.company && s.role === job.role);

    if (exists) {
      persistSaved(savedJobs.filter((s) => !(s.company === job.company && s.role === job.role)));
      return;
    }

    persistSaved([
      ...savedJobs,
      {
        page: PAGE_NAME,
        company: job.company,
        role: job.role,
        email: job.email,
        major: job.major,
        city: job.city,
        date: job.date,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const saveAllVisible = () => {
    const existingMap = new Set(savedJobs.map((s) => `${s.company}-${s.role}`));
    const additions = visibleJobs
      .filter((job) => !existingMap.has(`${job.company}-${job.role}`))
      .map((job) => ({
        page: PAGE_NAME,
        company: job.company,
        role: job.role,
        email: job.email,
        major: job.major,
        city: job.city,
        date: job.date,
        timestamp: new Date().toISOString(),
      }));

    if (additions.length === 0) return;
    persistSaved([...savedJobs, ...additions]);
  };

  const removeSavedByIndex = (index: number) => {
    const next = [...savedJobs];
    next.splice(index, 1);
    persistSaved(next);
  };

  const removeAllSaved = () => {
    persistSaved([]);
  };

  const search = () => {
    setHasSearched(true);
    setVisibleCount(Math.min(ITEMS_PER_PAGE, mockJobs.length));
    setSelectedCard(null);
  };

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, mockJobs.length));
  };

  const connectGmail = async () => {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 900);
    });

    setGmailConnected(true);
    localStorage.setItem('gmailConnected', 'true');

    if (returnToAutoApply) {
      setReturnToAutoApply(false);
      setActivePage('auto-apply');
    }
  };

  const disconnectGmail = () => {
    if (!window.confirm('هل أنت متأكد من فصل الاتصال؟')) return;
    setGmailConnected(false);
    localStorage.setItem('gmailConnected', 'false');
  };

  const startSending = (payload: {
    selected: SavedJob[];
    scheduleTime: string;
    delay: string;
    fileName: string | null;
  }) => {
    const next = [
      ...applications,
      ...payload.selected.map((job) => ({
        company: job.company,
        role: job.role,
        email: job.email,
        major: job.major,
        city: job.city,
        date: new Date().toISOString(),
        status: 'pending' as const,
      })),
    ];

    setApplicationsState(next);
    setApplications(next);
  };

  const navigate = (page: UserPageKey) => {
    setActivePage(page);
    setMobileSidebarOpen(false);
    if (page !== 'settings') setReturnToAutoApply(false);
  };

  const renderSection = () => {
    switch (activePage) {
      case 'home':
        return <UserHomeSection savedCount={savedJobs.length} />;
      case 'search':
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
            onSaveAllVisible={saveAllVisible}
          />
        );
      case 'saved':
        return (
          <UserSavedJobsSection
            savedJobs={savedJobs}
            onRemoveByIndex={removeSavedByIndex}
            onRemoveAll={removeAllSaved}
          />
        );
      case 'auto-apply':
        return (
          <UserAutoApplySection
            savedJobs={savedJobs}
            gmailConnected={gmailConnected}
            onGoToSettings={() => {
              setReturnToAutoApply(true);
              setActivePage('settings');
            }}
            onGoSavedJobs={() => setActivePage('saved')}
            onStartSending={startSending}
            onGoAnalytics={() => setActivePage('analytics')}
            onGoHome={() => setActivePage('home')}
          />
        );
      case 'analytics':
        return <UserAnalyticsSection applications={applications} />;
      case 'settings':
        return (
          <UserSettingsSection
            gmailConnected={gmailConnected}
            savedCount={savedJobs.length}
            returnToAutoApply={returnToAutoApply}
            onConnect={connectGmail}
            onDisconnect={disconnectGmail}
            onGoAutoApply={() => setActivePage('auto-apply')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout
      activePage={activePage}
      onNavigate={navigate}
      mobileSidebarOpen={mobileSidebarOpen}
      onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      onCloseSidebar={() => setMobileSidebarOpen(false)}
      savedCount={savedJobs.length}
    >
      {renderSection()}
    </UserLayout>
  );
}
