import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeNavbar() {
  const navigate = useNavigate();
  const { openLogin, openRegister } = useAuthModal();

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
        <button
          className={styles['btn-login-navbar']}
          onClick={() => {
            openLogin();
            navigate('/');
          }}
        >
          تسجيل الدخول
        </button>
        <button
          className={styles['btn-register']}
          onClick={() => {
            openRegister();
            navigate('/');
          }}
        >
          إنشاء حساب ←
        </button>
      </div>
    </nav>
  );
}
