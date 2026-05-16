import { cn } from '@/lib/utils';
import styles from './AdminSidebar.module.css';

export type AdminPageKey =
  | 'home'
  | 'users'
  | 'analytics'
  | 'announcements'
  | 'scraper'
  | 'settings';

interface AdminSidebarProps {
  activePage: AdminPageKey;
  onNavigate: (page: AdminPageKey) => void;
  scraperRunning: boolean;
  isMobileOpen: boolean;
}

export default function AdminSidebar({
  activePage,
  onNavigate,
  isMobileOpen,
}: AdminSidebarProps) {
  return (
    <aside className={cn(styles['sidebar-col'], isMobileOpen && styles['mobile-open'])}>
      <div className={styles['sidebar-inner']}>
        <p className={styles['sidebar-section-title']}>القائمة الإدارية</p>

        <nav>
          <ul className={styles['sidebar-nav']}>
            <li>
              <button
                className={cn(styles['nav-link'], activePage === 'home' && styles.active)}
                onClick={() => onNavigate('home')}
              >
                <svg
                  className={styles['nav-icon']}
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                الرئيسية
              </button>
            </li>
            <li>
              <button
                className={cn(styles['nav-link'], activePage === 'users' && styles.active)}
                onClick={() => onNavigate('users')}
              >
                <svg
                  className={styles['nav-icon']}
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                إدارة المستخدمين
              </button>
            </li>
            <li>
              <button
                className={cn(styles['nav-link'], activePage === 'analytics' && styles.active)}
                onClick={() => onNavigate('analytics')}
              >
                <svg
                  className={styles['nav-icon']}
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                التحليلات المتقدمة
              </button>
            </li>
            <li>
              <button
                className={cn(styles['nav-link'], activePage === 'announcements' && styles.active)}
                onClick={() => onNavigate('announcements')}
              >
                <svg
                  className={styles['nav-icon']}
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                الإشعارات والإعلانات
              </button>
            </li>
            <li>
              <button
                className={cn(styles['nav-link'], activePage === 'scraper' && styles.active)}
                onClick={() => onNavigate('scraper')}
              >
                <svg
                  className={styles['nav-icon']}
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
                </svg>
                إدارة السكراب
              </button>
            </li>

          </ul>
        </nav>
      </div>
    </aside>
  );
}
