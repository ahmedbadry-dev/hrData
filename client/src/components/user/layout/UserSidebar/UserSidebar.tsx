import { cn } from '@/lib/utils';
import styles from './UserSidebar.module.css';

export type UserPageKey = 'home' | 'search' | 'saved' | 'auto-apply' | 'analytics' | 'settings';

interface UserSidebarProps {
  activePage: UserPageKey;
  onNavigate: (page: UserPageKey) => void;
  savedCount: number;
  isMobileOpen: boolean;
}

export default function UserSidebar({
  activePage,
  onNavigate,
  savedCount: _savedCount,
  isMobileOpen,
}: UserSidebarProps) {
  return (
    <aside className={cn(styles['sidebar-col'], isMobileOpen && styles['mobile-open'])}>
      <div className={styles['sidebar-inner']}>
        <p className={styles['sidebar-section-title']}>القائمة</p>

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
                className={cn(styles['nav-link'], activePage === 'search' && styles.active)}
                onClick={() => onNavigate('search')}
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
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                اكتشف الوظائف
              </button>
            </li>
            <li>
              <button
                className={cn(styles['nav-link'], activePage === 'saved' && styles.active)}
                onClick={() => onNavigate('saved')}
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
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                الوظائف المحفوظة
              </button>
            </li>
            <li>
              <button
                className={cn(styles['nav-link'], activePage === 'auto-apply' && styles.active)}
                onClick={() => onNavigate('auto-apply')}
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
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                التقديم الآلي
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
                التحليلات والتتبع
              </button>
            </li>
            <li>
              <button
                className={cn(styles['nav-link'], activePage === 'settings' && styles.active)}
                onClick={() => onNavigate('settings')}
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
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="16" />
                  <line x1="12" y1="12" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="12" />
                  <line x1="20" y1="8" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="16" x2="15" y2="16" />
                  <line x1="17" y1="8" x2="23" y2="8" />
                </svg>
                الإعدادات
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
