import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { UserLayout, type UserPageKey } from '@/components/user/layout';
import {
  PAGE_NAME,
  getApplications,
  getSavedJobs,
  setApplications,
  setSavedJobs,
  type SavedJob,
  type UserJob,
} from '@/components/user/sections/userData';

export type DashboardContextType = {
  savedJobs: SavedJob[];
  applications: any[];
  gmailConnected: boolean;
  toggleSave: (job: UserJob) => void;
  saveAllVisible: (jobs: UserJob[]) => void;
  removeSavedByIndex: (index: number) => void;
  removeAllSaved: () => void;
  connectGmail: () => Promise<void>;
  disconnectGmail: () => void;
  startSending: (payload: {
    selected: SavedJob[];
    scheduleTime: string;
    delay: string;
    fileName: string | null;
  }) => void;
};

export default function UserDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  let activePage: UserPageKey = 'home';
  if (location.pathname.includes('/dashboard/jobs')) activePage = 'search';
  else if (location.pathname.includes('/dashboard/saved-jobs')) activePage = 'saved';
  else if (location.pathname.includes('/dashboard/auto-apply')) activePage = 'auto-apply';
  else if (location.pathname.includes('/dashboard/analysis')) activePage = 'analytics';
  else if (location.pathname.includes('/dashboard/settings')) activePage = 'settings';

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [savedJobs, setSavedJobsState] = useState<SavedJob[]>([]);
  const [applications, setApplicationsState] = useState(getApplications());
  const [gmailConnected, setGmailConnected] = useState(
    localStorage.getItem('gmailConnected') === 'true'
  );

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

  const saveAllVisible = (visibleJobs: UserJob[]) => {
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

  const connectGmail = async () => {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 900);
    });
    setGmailConnected(true);
    localStorage.setItem('gmailConnected', 'true');
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

  const handleNavigate = (page: UserPageKey) => {
    setMobileSidebarOpen(false);
    switch (page) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'search':
        navigate('/dashboard/jobs');
        break;
      case 'saved':
        navigate('/dashboard/saved-jobs');
        break;
      case 'auto-apply':
        navigate('/dashboard/auto-apply');
        break;
      case 'analytics':
        navigate('/dashboard/analysis');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
    }
  };

  const contextValue: DashboardContextType = {
    savedJobs,
    applications,
    gmailConnected,
    toggleSave,
    saveAllVisible,
    removeSavedByIndex,
    removeAllSaved,
    connectGmail,
    disconnectGmail,
    startSending,
  };

  return (
    <UserLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      mobileSidebarOpen={mobileSidebarOpen}
      onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      onCloseSidebar={() => setMobileSidebarOpen(false)}
      savedCount={savedJobs.length}
    >
      <Outlet context={contextValue} />
    </UserLayout>
  );
}
