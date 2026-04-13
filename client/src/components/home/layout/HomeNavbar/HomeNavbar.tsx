import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/modules/auth/api/hooks/use-auth';
import { useLogoutMutation } from '@/modules/auth/api/mutations';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openLogin, openRegister } = useAuthModal();
  const { data: authData, isLoading } = useAuth();
  const logoutMutation = useLogoutMutation();

  const isAuthenticated = authData?.isAuthenticated ?? false;
  const isHomePage = location.pathname === '/';
  const firstName = authData?.user?.firstName ?? authData?.user?.fullName?.split(' ')[0] ?? '';
  const greetingName = firstName.trim() || 'بك';

  return (
    <nav className={styles.nav}>
      <Link className={styles['nav-logo']} to="/">
        كُفُـؤ<em>.</em>
      </Link>
      <div className={styles['nav-links']}>
        {isHomePage && (
          <>
            <a className={styles['nav-link']} href="#how">
              كيف يعمل
            </a>
            <a className={styles['nav-link']} href="#features">
              المميزات
            </a>
            <a className={styles['nav-link']} href="#cta">
              للشركات
            </a>
          </>
        )}

        {isLoading ? null : isAuthenticated ? (
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
                navigate('/?mode=login', { replace: true });
              }}
            >
              تسجيل الدخول
            </button>
            <button
              className={styles['btn-register']}
              onClick={() => {
                openRegister();
                navigate('/?mode=register', { replace: true });
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
