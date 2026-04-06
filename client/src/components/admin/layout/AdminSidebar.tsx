import clsx from 'clsx';
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
  scraperRunning,
  isMobileOpen,
}: AdminSidebarProps) {
  return (
    <aside className={clsx(styles['sidebar-col'], isMobileOpen && styles['mobile-open'])}>
      <div className={styles['sidebar-inner']}>
        <p className={styles['sidebar-section-title']}>القائمة الإدارية</p>

        <nav>
          <ul className={styles['sidebar-nav']}>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'home' && styles.active)}
                onClick={() => onNavigate('home')}
              >
                <span className={styles['nav-icon']}>⌂</span>
                الرئيسية
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'users' && styles.active)}
                onClick={() => onNavigate('users')}
              >
                <span className={styles['nav-icon']}>◉</span>
                إدارة المستخدمين
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'analytics' && styles.active)}
                onClick={() => onNavigate('analytics')}
              >
                <span className={styles['nav-icon']}>◐</span>
                التحليلات المتقدمة
              </button>
            </li>
            <li>
              <button
                className={clsx(
                  styles['nav-link'],
                  activePage === 'announcements' && styles.active
                )}
                onClick={() => onNavigate('announcements')}
              >
                <span className={styles['nav-icon']}>◌</span>
                الإشعارات والإعلانات
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'scraper' && styles.active)}
                onClick={() => onNavigate('scraper')}
              >
                <span className={styles['nav-icon']}>⚙</span>
                إدارة السكراب
              </button>
            </li>
            <li>
              <button
                className={clsx(styles['nav-link'], activePage === 'settings' && styles.active)}
                onClick={() => onNavigate('settings')}
              >
                <span className={styles['nav-icon']}>◇</span>
                الإعدادات
              </button>
            </li>
          </ul>
        </nav>

        <div className={styles['sidebar-sys']}>
          <div className={styles['sys-title']}>حالة النظام</div>

          <div className={styles['sys-item']}>
            <span className={styles['sys-label']}>السكراب</span>
            <span className={styles['sys-val']}>
              <span className={clsx(styles['status-dot'], scraperRunning ? styles.on : styles.off)} />
              {scraperRunning ? ' شغال' : ' متوقف'}
            </span>
          </div>

          <div className={styles['sys-item']}>
            <span className={styles['sys-label']}>الوظائف</span>
            <span className={styles['sys-val']}>٢٠</span>
          </div>

          <div className={styles['sys-item']}>
            <span className={styles['sys-label']}>المستخدمين</span>
            <span className={styles['sys-val']}>١٢٤٧</span>
          </div>

          <div className={styles['sys-item']}>
            <span className={styles['sys-label']}>وقت التشغيل</span>
            <span className={styles['sys-val']}>١٤ يوم</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
