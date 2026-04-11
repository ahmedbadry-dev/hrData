import { type ReactNode } from 'react';
import UserNavbar from '@/components/user/layout/UserNavbar/UserNavbar';
import UserSidebar, { type UserPageKey } from '@/components/user/layout/UserSidebar/UserSidebar';
import { cn } from '@/lib/utils';
import styles from './UserLayout.module.css';

interface UserLayoutProps {
  children: ReactNode;
  activePage: UserPageKey;
  onNavigate: (page: UserPageKey) => void;
  mobileSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
  savedCount: number;
  onLogout?: () => void;
}

export default function UserLayout({
  children,
  activePage,
  onNavigate,
  mobileSidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
  savedCount,
  onLogout,
}: UserLayoutProps) {
  return (
    <div className={styles['user-layout-root']}>
      <UserNavbar onToggleSidebar={onToggleSidebar} onLogout={onLogout} />

      <div
        className={cn(styles['sidebar-overlay'], mobileSidebarOpen && styles.open)}
        onClick={onCloseSidebar}
      />

      <div className={styles['app-shell']}>
        <UserSidebar
          activePage={activePage}
          onNavigate={onNavigate}
          savedCount={savedCount}
          isMobileOpen={mobileSidebarOpen}
        />
        <main className={styles['content-col']}>{children}</main>
      </div>
    </div>
  );
}
