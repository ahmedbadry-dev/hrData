import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HomeNavbar from '@/components/home/layout/HomeNavbar/HomeNavbar';
import { Spinner } from '@/components/ui';
import { authService } from '@/modules/auth/api/auth.service';
import { useResetPasswordMutation } from '@/modules/auth/api/mutations';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { mapError } from '@/lib/error-mapper';
import styles from './AuthPages.module.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  // ── Token validation phase ──
  const {
    isLoading: isValidating,
    isError: isTokenInvalid,
    isSuccess: isTokenValid,
  } = useQuery({
    queryKey: ['validate-reset-token', token],
    queryFn: () => authService.validateResetToken(token),
    enabled: !!token,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  // 1. No token in URL
  if (!token) {
    return (
      <div dir="rtl">
        <HomeNavbar />
        <main className={styles.pageContainer}>
          <InvalidTokenState />
        </main>
      </div>
    );
  }

  // 2. Validating token
  if (isValidating) {
    return (
      <div dir="rtl">
        <HomeNavbar />
        <main className={styles.pageContainer}>
          <section className={styles.authCard}>
            <div className={`${styles.iconWrap} ${styles.iconLoading}`}>🔗</div>
            <h1 className={styles.title}>جاري التحقق من الرابط...</h1>
            <p className={styles.subtitle}>لحظات قليلة...</p>
            <Spinner size="lg" aria-label="جاري التحميل" />
          </section>
        </main>
      </div>
    );
  }

  // 3. Invalid token
  if (isTokenInvalid) {
    return (
      <div dir="rtl">
        <HomeNavbar />
        <main className={styles.pageContainer}>
          <InvalidTokenState />
        </main>
      </div>
    );
  }

  // 4. Valid token — show form
  if (isTokenValid) {
    return (
      <div dir="rtl">
        <HomeNavbar />
        <main className={styles.pageContainer}>
          <NewPasswordForm token={token} />
        </main>
      </div>
    );
  }

  return null;
}

// ╔══════════════════════════════════════════╗
// ║  InvalidTokenState                       ║
// ╚══════════════════════════════════════════╝
function InvalidTokenState() {
  const navigate = useNavigate();
  const { openForgotPassword } = useAuthModal();

  return (
    <section className={styles.authCard} role="alert">
      <div className={`${styles.iconWrap} ${styles.iconError}`}>❌</div>
      <h1 className={styles.title}>رابط غير صالح أو منتهي الصلاحية</h1>
      <p className={styles.subtitle}>
        رابط إعادة تعيين كلمة المرور الذي استخدمته غير صالح
        أو انتهت صلاحيته. يرجى طلب رابط جديد.
      </p>
      <div className={styles.actions}>
        <button
          className={styles.solidBtn}
          onClick={() => {
            navigate('/', { replace: true });
            openForgotPassword();
          }}
        >
          طلب رابط جديد
        </button>
      </div>
    </section>
  );
}

// ╔══════════════════════════════════════════╗
// ║  NewPasswordForm                         ║
// ╚══════════════════════════════════════════╝
function NewPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const resetMutation = useResetPasswordMutation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      newErrors.newPassword = 'يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم واحد';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    resetMutation.mutate(
      { token, payload: { password: newPassword, confirmPassword } },
      {
        onSuccess: () => {
          setIsResetSuccess(true);
        },
        onError: (error) => {
          setServerError(mapError(error));
        },
      }
    );
  };

  const hasErrors = Object.values(errors).some((v) => Boolean(v));

  // ── SUCCESS STATE ──
  if (isResetSuccess) {
    return (
      <section className={styles.authCard} role="status">
        <div className={`${styles.iconWrap} ${styles.iconSuccess}`}>✅</div>
        <h1 className={styles.title}>تم تغيير كلمة المرور بنجاح!</h1>
        <p className={styles.subtitle}>
          يمكنك الآن تسجيل الدخول باستخدام كلمة مرورك الجديدة.
        </p>
        <div className={styles.actions}>
          <button
            className={styles.solidBtn}
            onClick={() => {
              navigate('/', { replace: true });
              openLogin();
            }}
          >
            الذهاب إلى الصفحة الرئيسية
          </button>
        </div>
      </section>
    );
  }

  // ── FORM ──
  return (
    <section className={styles.authCard}>
      <div className={`${styles.iconWrap} ${styles.iconLoading}`}>🔐</div>
      <h1 className={styles.title}>إعادة تعيين كلمة المرور</h1>
      <p className={styles.subtitle}>أدخل كلمة مرور جديدة لحسابك</p>

      {serverError && (
        <div className={styles.errorBanner} role="alert">
          <span>⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label>كلمة المرور الجديدة</label>
          <input
            id="reset-newPassword"
            className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
            type="password"
            dir="ltr"
            value={newPassword}
            disabled={resetMutation.isPending}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
              if (serverError) setServerError(null);
            }}
            placeholder="********"
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? 'reset-newPassword-error' : undefined}
          />
          {errors.newPassword && (
            <span id="reset-newPassword-error" className={styles.errorText} role="alert">
              {errors.newPassword}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label>تأكيد كلمة المرور الجديدة</label>
          <input
            id="reset-confirmPassword"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            type="password"
            dir="ltr"
            value={confirmPassword}
            disabled={resetMutation.isPending}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              if (serverError) setServerError(null);
            }}
            placeholder="********"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'reset-confirmPassword-error' : undefined}
          />
          {errors.confirmPassword && (
            <span id="reset-confirmPassword-error" className={styles.errorText} role="alert">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.solidBtn}
            type="submit"
            disabled={resetMutation.isPending || hasErrors}
            aria-disabled={resetMutation.isPending || hasErrors}
          >
            {resetMutation.isPending ? 'جاري تغيير كلمة المرور...' : 'تغيير كلمة المرور'}
          </button>
        </div>
      </form>
    </section>
  );
}
