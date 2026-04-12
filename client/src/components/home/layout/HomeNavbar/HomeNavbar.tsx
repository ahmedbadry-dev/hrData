import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/modules/auth/api/hooks/use-auth';
import { useLogoutMutation } from '@/modules/auth/api/mutations';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeNavbar() {
  const navigate = useNavigate();
  const { openLogin, openRegister } = useAuthModal();
  const { data: authData } = useAuth();
  const logoutMutation = useLogoutMutation();

  const isAuthenticated = authData?.isAuthenticated ?? false;
  const firstName = authData?.user?.firstName ?? authData?.user?.fullName?.split(' ')[0] ?? '';
  const greetingName = firstName.trim() || 'بك';

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

        {isAuthenticated ? (
          <>
            <span className={styles['nav-welcome']}>مرحباً {greetingName}</span>
            <button
              className={styles['btn-login-navbar']}
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </nav>
  );
}
