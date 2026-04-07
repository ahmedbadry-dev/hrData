import { Link } from 'react-router-dom';
import styles from '@/pages/home/HomePage.module.css';

export default function HomeNavbar() {
  return (
    <nav className={styles.nav}>
      <a className={styles['nav-logo']} href="#">
        كُفُـؤ<em>.</em>
      </a>
      <div className={styles['nav-links']}>
        <a className={styles['nav-link']} href="#how">
          كيف يعمل
        </a>
        <a className={styles['nav-link']} href="#features">
          المميزات
        </a>
        <a className={styles['nav-link']} href="#cta">
          للشركات
        </a>
        <Link className={styles['btn-login']} to="/dashboard">
          دخول لوحة التحكم ←
        </Link>
      </div>
    </nav>
  );
}
