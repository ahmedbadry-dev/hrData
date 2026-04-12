import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HomeNavbar from '@/components/home/layout/HomeNavbar/HomeNavbar';
import { Spinner } from '@/components/ui';
import { authService } from '@/modules/auth/api/auth.service';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { mapErrorToArabic } from '@/lib/error-mapper';
import styles from './AuthPages.module.css';

type VerifyStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const token = useMemo(() => {
    const fromQuery = searchParams.get('token')?.trim();
    if (fromQuery) return fromQuery;

    const hashValue = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;

    const hashParams = new URLSearchParams(hashValue);
    return hashParams.get('token')?.trim() ?? '';
  }, [searchParams]);

  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [message, setMessage] = useState('');
  const hasRequestedVerification = useRef(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = status === 'error' ? 'hidden' : '';
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [status]);

  useEffect(() => {
    const verify = async () => {
      if (hasRequestedVerification.current) {
        return;
      }

      hasRequestedVerification.current = true;

      if (!token) {
        setStatus('error');
        setMessage('رابط التحقق غير صالح');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(mapErrorToArabic(response.message || 'User verified successfully'));
      } catch (err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const backendMessage =
          axiosError.response?.data?.message || 'فشل التحقق من البريد الإلكتروني';
        setStatus('error');
        setMessage(mapErrorToArabic(backendMessage));
      }
    };

    void verify();
  }, [token]);

  return (
    <div dir="rtl">
      <HomeNavbar />

      <main className={`${styles.pageContainer} ${status === 'error' ? styles.noScroll : ''}`}>
        <section className={styles.authCard}>
          {status === 'loading' && (
            <>
              <div className={`${styles.iconWrap} ${styles.iconLoading}`}>✉️</div>
              <h1 className={styles.title}>جاري التحقق من بريدك</h1>
              <p className={styles.subtitle}>لحظات قليلة ونكمل تفعيل حسابك</p>
              <Spinner />
            </>
          )}

          {status === 'success' && (
            <>
              <div className={`${styles.iconWrap} ${styles.iconSuccess}`}>✓</div>
              <h1 className={styles.title}>تم التحقق بنجاح</h1>
              <p className={styles.subtitle}>{message}</p>

              <div className={styles.actions}>
                <button
                  className={styles.outlineBtn}
                  onClick={() => navigate('/', { replace: true })}
                >
                  الذهاب للرئيسية
                </button>
                <button
                  className={styles.solidBtn}
                  onClick={() => {
                    openLogin();
                    navigate('/?mode=login', { replace: true });
                  }}
                >
                  تسجيل الدخول
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className={`${styles.iconWrap} ${styles.iconError}`}>!</div>
              <h1 className={styles.title}>تعذر التحقق</h1>
              <p className={styles.subtitle}>{message}</p>

              <div className={styles.actions}>
                <button
                  className={styles.outlineBtn}
                  onClick={() => navigate('/', { replace: true })}
                >
                  الذهاب للرئيسية
                </button>
                <button
                  className={styles.solidBtn}
                  onClick={() => {
                    openLogin();
                    navigate('/?mode=login', { replace: true });
                  }}
                >
                  تسجيل الدخول
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
