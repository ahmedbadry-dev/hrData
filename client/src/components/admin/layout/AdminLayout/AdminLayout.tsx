import { type ReactNode } from 'react';
import AdminNavbar from '@/components/admin/layout/AdminNavbar/AdminNavbar';
import AdminSidebar, {
  type AdminPageKey,
} from '@/components/admin/layout/AdminSidebar/AdminSidebar';
import { cn } from '@/lib/utils';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
  activePage: AdminPageKey;
  onNavigate: (page: AdminPageKey) => void;
  scraperRunning: boolean;
  mobileSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
}

export default function AdminLayout({
  children,
  activePage,
  onNavigate,
  scraperRunning,
  mobileSidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
}: AdminLayoutProps) {
  return (
    <div className={styles['admin-layout-root']}>
      <AdminNavbar onToggleSidebar={onToggleSidebar} isSidebarOpen={mobileSidebarOpen} />

      <div
        className={cn(styles['sidebar-overlay'], mobileSidebarOpen && styles.open)}
        onClick={onCloseSidebar}
      />

      <div className={styles['app-shell']}>
        <AdminSidebar
          activePage={activePage}
          onNavigate={onNavigate}
          scraperRunning={scraperRunning}
          isMobileOpen={mobileSidebarOpen}
        />

        <main className={styles['content-col']}>{children}</main>
      </div>
    </div>
  );
}
