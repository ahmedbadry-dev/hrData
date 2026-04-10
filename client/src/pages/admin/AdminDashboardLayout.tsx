import { useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AdminLayout, type AdminPageKey } from '@/components/admin/layout';
import {
  AdminModals,
  AdminToast,
  type AnnouncementForm,
  type EditUserForm,
} from '@/components/admin/sections';
import {
  initialAdminAnnouncements,
  initialAdminUsers,
  initialScraperLogs,
} from '@/components/admin/sections/adminData';

export type AdminDashboardContextType = {
  users: typeof initialAdminUsers;
  filteredUsers: typeof initialAdminUsers;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: 'all' | 'active' | 'suspended';
  setActiveFilter: (val: 'all' | 'active' | 'suspended') => void;
  toggleUserStatus: (id: number) => void;
  deleteUser: (id: number) => void;
  openEditUser: (id: number) => void;
  openActivityId: number | null;
  setOpenActivityId: React.Dispatch<React.SetStateAction<number | null>>;

  announcements: typeof initialAdminAnnouncements;
  deleteAnnouncement: (id: number) => void;
  openCreateAnnouncement: () => void;

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

  const [users, setUsers] = useState(initialAdminUsers);
  const [announcements, setAnnouncements] = useState(initialAdminAnnouncements);
  const [scraperLogs, setScraperLogs] = useState(initialScraperLogs);
  const [scraperRunning, setScraperRunning] = useState(true);
  const [savedToken, setSavedToken] = useState('');
  const [tokenVisible, setTokenVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [openActivityId, setOpenActivityId] = useState<number | null>(null);

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditUserForm>({
    name: '',
    email: '',
    phone: '',
    status: 'active',
  });

  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announceForm, setAnnounceForm] = useState<AnnouncementForm>({
    title: '',
    body: '',
    type: 'info',
    target: 'جميع المستخدمين',
  });

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

  const filteredUsers = useMemo(() => {
    let list = users;
    if (activeFilter !== 'all') list = list.filter((u) => u.status === activeFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.includes(searchQuery) || u.email.toLowerCase().includes(q) || u.phone.includes(q)
      );
    }

    return list;
  }, [users, activeFilter, searchQuery]);

  const openEditUser = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    setEditingUserId(id);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
    });
    setEditOpen(true);
  };

  const saveEditedUser = () => {
    if (editingUserId === null) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUserId ? { ...u, ...editForm } : u)));
    setEditOpen(false);
    setEditingUserId(null);
    showToast('تم حفظ بيانات المستخدم');
  };

  const toggleUserStatus = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const action = user.status === 'active' ? 'إيقاف' : 'تفعيل';
    if (!window.confirm(`هل تريد ${action} حساب ${user.name}؟`)) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      )
    );
    showToast(`تم ${action} الحساب`);
  };

  const deleteUser = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    if (!window.confirm(`هل تريد حذف حساب ${user.name} نهائياً؟`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (openActivityId === id) setOpenActivityId(null);
    showToast('تم حذف المستخدم', 'error');
  };

  const deleteAnnouncement = (id: number) => {
    if (!window.confirm('حذف هذا الإشعار؟')) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    showToast('تم حذف الإشعار', 'error');
  };

  const openCreateAnnouncement = () => setAnnounceOpen(true);

  const saveAnnouncement = () => {
    if (!announceForm.title.trim()) {
      showToast('أدخل عنوان الإشعار', 'error');
      return;
    }

    const nextId = (announcements[0]?.id ?? 0) + 1;
    setAnnouncements((prev) => [
      {
        id: nextId,
        title: announceForm.title,
        body: announceForm.body,
        type: announceForm.type,
        target: announceForm.target,
        date: new Date().toLocaleDateString('ar-SA'),
      },
      ...prev,
    ]);

    setAnnounceOpen(false);
    setAnnounceForm({
      title: '',
      body: '',
      type: 'info',
      target: 'جميع المستخدمين',
    });
    showToast('تم إرسال الإشعار');
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
    users,
    filteredUsers,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    toggleUserStatus,
    deleteUser,
    openEditUser,
    openActivityId,
    setOpenActivityId,
    announcements,
    deleteAnnouncement,
    openCreateAnnouncement,
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

      <AdminModals
        editOpen={editOpen}
        editForm={editForm}
        onEditChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
        onSaveEdit={saveEditedUser}
        onCloseEdit={() => {
          setEditOpen(false);
          setEditingUserId(null);
        }}
        announceOpen={announceOpen}
        announceForm={announceForm}
        onAnnounceChange={(patch) => setAnnounceForm((prev) => ({ ...prev, ...patch }))}
        onSaveAnnounce={saveAnnouncement}
        onCloseAnnounce={() => setAnnounceOpen(false)}
      />

      <AdminToast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
