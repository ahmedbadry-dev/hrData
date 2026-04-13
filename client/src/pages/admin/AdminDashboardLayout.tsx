import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout, type AdminPageKey } from '@/components/admin/layout';
import { AdminToast, initialScraperLogs } from '@/components/admin/sections';

export type AdminDashboardContextType = {
  openActivityId: number | null;
  setOpenActivityId: React.Dispatch<React.SetStateAction<number | null>>;

  scraperRunning: boolean;
  scraperLogs: typeof initialScraperLogs;
  savedToken: string;
  tokenVisible: boolean;
  saveToken: (token: string) => void;
  toggleTokenVisibility: () => void;
  toggleScraper: () => void;
  clearLogs: () => void;
  exportLogs: () => void;

  showToast: (message: string, type?: 'success' | 'error') => void;
};

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  let activePage: AdminPageKey = 'home';
  if (location.pathname.includes('/admin/users')) activePage = 'users';
  else if (location.pathname.includes('/admin/analysis')) activePage = 'analytics';
  else if (location.pathname.includes('/admin/notifications')) activePage = 'announcements';
  else if (location.pathname.includes('/admin/scrap')) activePage = 'scraper';
  else if (location.pathname.includes('/admin/settings')) activePage = 'settings';

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [scraperLogs, setScraperLogs] = useState(initialScraperLogs);
  const [scraperRunning, setScraperRunning] = useState(true);
  const [savedToken, setSavedToken] = useState('');
  const [tokenVisible, setTokenVisible] = useState(false);

  const [openActivityId, setOpenActivityId] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const saveToken = (token: string) => {
    const value = token.trim();
    if (!value) {
      showToast('الرجاء إدخال الرمز أولاً', 'error');
      return;
    }
    setSavedToken(value);
    showToast('تم حفظ API Token بنجاح');
  };

  const toggleTokenVisibility = () => setTokenVisible((prev) => !prev);

  const toggleScraper = () => {
    setScraperRunning((prev) => {
      const next = !prev;
      const now = new Date();
      const ts = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setScraperLogs((logs) => [
        next
          ? { t: 'green', m: `[${ts}] ▶ تم تشغيل السكراب يدوياً` }
          : { t: 'red', m: `[${ts}] ⏹ تم إيقاف السكراب يدوياً` },
        ...logs,
      ]);
      return next;
    });
  };

  const exportLogs = () => {
    const text = scraperLogs.map((l) => l.m).join('\n');
    const a = document.createElement('a');
    a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
    a.download = 'scraper-log.txt';
    a.click();
    showToast('تم تصدير السجل');
  };

  const clearLogs = () => {
    setScraperLogs([{ t: 'gray', m: `[${new Date().toLocaleTimeString('en-SA')}] — السجل فارغ` }]);
  };

  const handleNavigate = (page: AdminPageKey) => {
    setMobileSidebarOpen(false);
    switch (page) {
      case 'home':
        navigate('/admin');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'analytics':
        navigate('/admin/analysis');
        break;
      case 'announcements':
        navigate('/admin/notifications');
        break;
      case 'scraper':
        navigate('/admin/scrap');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
    }
  };

  const contextValue: AdminDashboardContextType = {
    openActivityId,
    setOpenActivityId,
    scraperRunning,
    scraperLogs,
    savedToken,
    tokenVisible,
    saveToken,
    toggleTokenVisibility,
    toggleScraper,
    clearLogs,
    exportLogs,
    showToast,
  };

  return (
    <div dir="rtl">
      <AdminLayout
        activePage={activePage}
        onNavigate={handleNavigate}
        scraperRunning={scraperRunning}
        mobileSidebarOpen={mobileSidebarOpen}
        onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        onCloseSidebar={() => setMobileSidebarOpen(false)}
      >
        <Outlet context={contextValue} />
      </AdminLayout>

      <AdminToast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
