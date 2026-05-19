import { useState, useEffect, useRef } from 'react';
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navbarRef = useRef<HTMLElement | null>(null);

  const isAuthenticated = authData?.isAuthenticated ?? false;
  const firstName = authData?.user?.firstName ?? authData?.user?.fullName?.split(' ')[0] ?? '';
  const greetingName = firstName.trim() || 'بك';

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        if (id === 'contact') {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } else {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const scrollToSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }

    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (id === 'contact') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav ref={navbarRef} className={styles.nav}>
        {/* Exact same logo layout from template */}
        <Link className={styles.logo} to="/" onClick={(e) => scrollToSection('top', e)}>
          <div className={styles['logo-box']}>D</div>
          <div className={styles['logo-text']}>
            <h2>HR</h2>
            <span>DATA</span>
          </div>
        </Link>

        {/* Desktop links in the middle/center */}
        <div className={styles['nav-menu-center']}>
          <a className={styles['nav-link']} href="#" onClick={(e) => scrollToSection('top', e)}>
            الرئيسية
          </a>
          <a className={styles['nav-link']} href="#how" onClick={(e) => scrollToSection('how', e)}>
            كيف يعمل
          </a>
          <a className={styles['nav-link']} href="#features" onClick={(e) => scrollToSection('features', e)}>
            المميزات
          </a>
          <a className={styles['nav-link']} href="#contact" onClick={(e) => scrollToSection('contact', e)}>
            تواصل معنا
          </a>
        </div>

        {/* Auth Buttons on the left */}
        <div className={styles['nav-auth-left']}>
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

        {/* Hamburger button for mobile */}
        <button
          className={styles['menu-btn']}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="القائمة"
        >
          <svg
            className={`${styles['hamburger-svg']} ${isMenuOpen ? styles.open : ''}`}
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

        {/* Mobile menu drawer */}
        <div className={`${styles['mobile-menu']} ${isMenuOpen ? styles.active : ''}`}>
          <div className={styles['mobile-menu-content']}>
            <a
              href="#"
              className={styles['nav-link-mobile']}
              onClick={(e) => scrollToSection('top', e)}
            >
              الرئيسية <span className={styles['arrow-icon']}>←</span>
            </a>
            <a
              href="#how"
              className={styles['nav-link-mobile']}
              onClick={(e) => scrollToSection('how', e)}
            >
              كيف يعمل <span className={styles['arrow-icon']}>←</span>
            </a>
            <a
              href="#features"
              className={styles['nav-link-mobile']}
              onClick={(e) => scrollToSection('features', e)}
            >
              المميزات <span className={styles['arrow-icon']}>←</span>
            </a>
            <a
              href="#contact"
              className={styles['nav-link-mobile']}
              onClick={(e) => scrollToSection('contact', e)}
            >
              تواصل معنا <span className={styles['arrow-icon']}>←</span>
            </a>

            {isLoading ? null : isAuthenticated ? (
              <>
                <p className={styles['mobile-label']}>مرحباً بك مجدداً</p>
                <div className={styles['mobile-btns']}>
                  <button
                    className={styles['btn-login-navbar']}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setIsMenuOpen(false);
                      logoutMutation.mutate();
                    }}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles['mobile-label']}>ابدأ الآن أو أنشئ حساب جديد</p>
                <div className={styles['mobile-btns']}>
                  <button
                    className={styles['btn-login-navbar']}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setIsMenuOpen(false);
                      openLogin();
                      navigate('/?mode=login', { replace: true });
                    }}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    className={styles['btn-register']}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setIsMenuOpen(false);
                      openRegister();
                      navigate('/?mode=register', { replace: true });
                    }}
                  >
                    إنشاء حساب
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
      {/* Navbar spacer */}
      <div style={{ height: '73px' }}></div>
    </>
  );
}


