import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/api/hooks';
import { cn } from '@/lib/utils';
import styles from './AdminNavbar.module.css';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function AdminNavbar({ onToggleSidebar, isSidebarOpen }: AdminNavbarProps) {
  const navigate = useNavigate();
  const { data: authData } = useAuth();
  const firstName = authData?.user?.firstName || authData?.user?.fullName?.split(' ')[0] || '';

  return (
    <header className={styles['site-header']}>
      <div className={styles['header-left']}>
        <button className={styles['hamburger-btn']} onClick={onToggleSidebar} aria-label="القائمة">
          <svg
            className={cn(styles['hamburger-svg'], isSidebarOpen && styles['open'])}
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line className={styles['line-top']} x1="3" y1="6" x2="21" y2="6" />
            <line className={styles['line-middle']} x1="3" y1="12" x2="21" y2="12" />
            <line className={styles['line-bottom']} x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className={styles['logo-group']}>
          <div className={styles['logo-row']}>
            <Link className={styles.logo} to="/">
              <div className={styles['logo-box']}>D</div>
              <div className={styles['logo-text']}>
                <h2>HR</h2>
                <span>DATA</span>
              </div>
            </Link>
            <span className={styles['admin-badge']}>ADMIN</span>
          </div>
          <span className={styles['logo-tagline']}>لوحة الإدارة</span>
        </div>
      </div>

      <div className={styles['header-right']}>
        <span className={styles['admin-user']}>مرحباً، {firstName}</span>
        <button className={styles['btn-logout']} onClick={() => navigate('/')}>
          ← اذهب للرئيسيه
        </button>
      </div>
    </header>
  );
}
