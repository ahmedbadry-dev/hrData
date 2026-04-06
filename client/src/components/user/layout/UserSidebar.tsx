import clsx from 'clsx';
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
  savedCount,
  isMobileOpen,
}: UserSidebarProps) {
  return (
    <aside className={clsx(styles['sidebar-col'], isMobileOpen && styles['mobile-open'])}>
      <div className={styles['sidebar-inner']}>
        <p className={styles['sidebar-section-title']}>القائمة</p>

        <nav>
          <ul className={styles['sidebar-nav']}>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'home' && styles.active)}
                onClick={() => onNavigate('home')}
              >
                <span className={styles['nav-icon']}>◈</span>
                الرئيسية
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'search' && styles.active)}
                onClick={() => onNavigate('search')}
              >
                <span className={styles['nav-icon']}>◎</span>
                اكتشف الوظائف
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'saved' && styles.active)}
                onClick={() => onNavigate('saved')}
              >
                <span className={styles['nav-icon']}>◆</span>
                الوظائف المحفوظة
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'auto-apply' && styles.active)}
                onClick={() => onNavigate('auto-apply')}
              >
                <span className={styles['nav-icon']}>◉</span>
                التقديم الآلي
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'analytics' && styles.active)}
                onClick={() => onNavigate('analytics')}
              >
                <span className={styles['nav-icon']}>◐</span>
                التحليلات والتتبع
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'settings' && styles.active)}
                onClick={() => onNavigate('settings')}
              >
                <span className={styles['nav-icon']}>◌</span>
                الإعدادات
              </button>
            </li>
          </ul>
        </nav>

        <div className={styles['sidebar-sys']}>
          <div className={styles['sys-title']}>إحصائيات</div>
          <div className={styles['sys-item']}>
            <span className={styles['sys-label']}>وظيفة متاحة</span>
            <span className={styles['sys-val']}>٢٠</span>
          </div>
          <div className={styles['sys-item']}>
            <span className={styles['sys-label']}>شركة مشاركة</span>
            <span className={styles['sys-val']}>١٠</span>
          </div>
          <div className={styles['sys-item']}>
            <span className={styles['sys-label']}>محفوظة</span>
            <span className={styles['sys-val']}>{savedCount}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
