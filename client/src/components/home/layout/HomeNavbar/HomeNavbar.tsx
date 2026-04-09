import { Link } from 'react-router-dom';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

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
        <Link className={styles['btn-login-navbar']} to="/login">
          تسجيل الدخول
        </Link>
        <Link className={styles['btn-register']} to="/register">
          إنشاء حساب ←
        </Link>
      </div>
    </nav>
  );
}
