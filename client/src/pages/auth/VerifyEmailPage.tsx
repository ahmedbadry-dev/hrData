import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HomeNavbar from '@/components/home/layout/HomeNavbar/HomeNavbar';
import { Spinner } from '@/components/ui';
import { authService } from '@/modules/auth/api/auth.service';
import { useAuthModal } from '@/contexts/AuthModalContext';
import styles from './AuthPages.module.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const token = searchParams.get('token')?.trim() ?? '';

  // useQuery (not useMutation) because:
  // - React Query's cache deduplicates across StrictMode remounts
  // - The backend is idempotent: already-verified users return 200
  // - staleTime: Infinity prevents refetching if the user navigates away and back
  const { isSuccess, isError } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => authService.verifyEmail(token),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // 1. No token in URL
  if (!token) {
    return (
      <div dir="rtl">
        <HomeNavbar />
        <main className={styles.pageContainer}>
          <VerifyEmailError />
        </main>
      </div>
    );
  }

  // 2. Success
  if (isSuccess) {
    return (
      <div dir="rtl">
        <HomeNavbar />
        <main className={styles.pageContainer}>
          <section className={styles.authCard} role="status">
            <div className={`${styles.iconWrap} ${styles.iconSuccess}`}>✓</div>
            <h1 className={styles.title}>تم التحقق بنجاح!</h1>
            <p className={styles.subtitle}>
              تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول والاستفادة من جميع مميزات المنصة.
            </p>
            <div className={styles.actions}>
              <button
                className={styles.solidBtn}
                onClick={() => {
                  navigate('/', { replace: true });
                  openLogin();
                }}
              >
                تسجيل الدخول الآن
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // 3. Error (invalid or expired token)
  if (isError) {
    return (
      <div dir="rtl">
        <HomeNavbar />
        <main className={styles.pageContainer}>
          <VerifyEmailError />
        </main>
      </div>
    );
  }

  // 4. Loading — isLoading is true from the moment enabled=true until query settles
  return (
    <div dir="rtl">
      <HomeNavbar />
      <main className={styles.pageContainer}>
        <section className={styles.authCard} role="status">
          <div className={`${styles.iconWrap} ${styles.iconLoading}`}>✉️</div>
          <h1 className={styles.title}>جاري التحقق من بريدك الإلكتروني...</h1>
          <p className={styles.subtitle}>لحظات قليلة ونكمل تفعيل حسابك</p>
          <Spinner size="lg" aria-label="جاري التحميل" />
        </section>
      </main>
    </div>
  );
}

function VerifyEmailError() {
  const navigate = useNavigate();

  return (
    <section className={styles.authCard} role="alert">
      <div className={`${styles.iconWrap} ${styles.iconError}`}>❌</div>
      <h1 className={styles.title}>انتهت صلاحية رابط التحقق</h1>
      <p className={styles.subtitle}>
        رابط التحقق الذي استخدمته غير صالح أو انتهت صلاحيته. يرجى التسجيل مجدداً أو طلب رابط تحقق
        جديد.
      </p>
      <div className={styles.actions}>
        <button className={styles.outlineBtn} onClick={() => navigate('/', { replace: true })}>
          العودة إلى الصفحة الرئيسية
        </button>
      </div>
    </section>
  );
}
