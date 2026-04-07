import styles from './UserNavbar.module.css';

interface UserNavbarProps {
  onToggleSidebar: () => void;
}

export default function UserNavbar({ onToggleSidebar }: UserNavbarProps) {
  return (
    <header className={styles['site-header']}>
      <div className={styles['header-left']}>
        <button className={styles['hamburger-btn']} onClick={onToggleSidebar} aria-label="القائمة">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className={styles['logo-sub']}>
          <a className={styles.logo} href="#">
            كُـفُـؤ<span>.</span>
          </a>
          <span className={styles['logo-tagline']}>منصة التوظيف المباشر</span>
        </div>
      </div>

      <div className={styles['header-right']}>
        <span className={styles['admin-user']}>مرحباً بك ◈</span>
        <div className={styles['header-stamp']}>
          توظيف
          <br />
          مباشر
          <br />
          ٢٠٢٦
        </div>
        <button className={styles['btn-logout']}>← خروج</button>
      </div>
    </header>
  );
}
