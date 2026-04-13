import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HomeNavbar from '@/components/home/layout/HomeNavbar/HomeNavbar';
import { Spinner } from '@/components/ui';
import { authService } from '@/modules/auth/api/auth.service';
import { useResetPasswordMutation } from '@/modules/auth/api/mutations';
import { mapError } from '@/lib/error-mapper';
import styles from './ResetPasswordPage.module.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const { isLoading: isValidating, isError: isTokenInvalid } = useQuery({
    queryKey: ['validate-reset-token', token],
    queryFn: () => authService.validateResetToken(token),
    enabled: !!token,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const resetMutation = useResetPasswordMutation();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    server?: string;
  }>({});
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 8 || !/\d/.test(password)) {
      newErrors.password = 'يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    resetMutation.mutate(
      { token, payload: { password, confirmPassword } },
      {
        onSuccess: () => {
          setStatus('success');
        },
        onError: (error) => {
          setErrors({ server: mapError(error) });
        },
      }
    );
  };

  let content: React.ReactNode;

  if (!token) {
    content = (
      <div className={styles['error-panel']}>
        <div className={styles['error-icon-wrap']}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className={styles['error-title']}>رابط غير صالح</h2>
        <p className={styles['error-message']}>
          رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.
        </p>
        <div className={styles['action-row']}>
          <Link to="/" className={styles['submit-btn']} style={{ textDecoration: 'none' }}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  } else if (isValidating) {
    content = (
      <div className={styles['form-card']}>
        <Spinner size="lg" aria-label="جاري التحقق" />
        <p style={{ marginTop: 16, color: 'var(--muted)' }}>جاري التحقق من الرابط...</p>
      </div>
    );
  } else if (isTokenInvalid || status === 'error') {
    content = (
      <div className={styles['error-panel']}>
        <div className={styles['error-icon-wrap']}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className={styles['error-title']}>رابط غير صالح</h2>
        <p className={styles['error-message']}>
          رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.
        </p>
        <div className={styles['action-row']}>
          <Link to="/" className={styles['submit-btn']} style={{ textDecoration: 'none' }}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  } else if (status === 'success') {
    content = (
      <div className={styles['success-panel']}>
        <div className={styles['success-icon-wrap']}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className={styles['success-title']}>تم بنجاح!</h2>
        <p className={styles['success-message']}>
          تم تعيين كلمة المرور الجديدة. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
        </p>
        <Link
          to="/?mode=login"
          className={styles['submit-btn']}
          style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
        >
          تسجيل الدخول ←
        </Link>
      </div>
    );
  } else {
    content = (
      <>
        <h2 className={styles['form-title']}>تعيين كلمة مرور جديدة</h2>
        <p className={styles['form-subtitle']}>أدخل كلمة المرور الجديدة لحسابك</p>

        {errors.server && (
          <div className={styles['server-error']}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errors.server}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>كلمة المرور الجديدة</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="8 أحرف على الأقل"
              dir="ltr"
              className={errors.password ? styles['input-error'] : ''}
            />
            {errors.password && <span className={styles['field-error']}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label>تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder="أعد إدخال كلمة المرور"
              dir="ltr"
              className={errors.confirmPassword ? styles['input-error'] : ''}
            />
            {errors.confirmPassword && (
              <span className={styles['field-error']}>{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className={styles['submit-btn']} disabled={resetMutation.isPending}>
            {resetMutation.isPending ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة ←'}
          </button>
        </form>

        <div className={styles['back-link']}>
          <Link to="/">العودة للرئيسية</Link>
        </div>
      </>
    );
  }

  return (
    <div className={styles['reset-page']}>
      <HomeNavbar />
      <div className={styles['reset-hero']}>
        <div className={styles['reset-left']}>
          <div className={styles.eyebrow}>أمان الحساب</div>
          <h1 className={styles.headline}>
            استعادة
            <br />
            <em>كلمة المرور</em>
          </h1>
          <p className={styles['body-text']}>
            أدخل كلمة المرور الجديدة لتعيينها على حسابك. تأكد من اختيار كلمة مرور قوية تحتوي على 8
            أحرف على الأقل.
          </p>

          <div className={styles['form-card']}>{content}</div>
        </div>

        <div className={styles['reset-right']}>
          <div className={styles.stamp}>
            استعادة
            <br />
            كلمة المرور
            <br />
            2026
          </div>
          <div>
            <div className={styles['featured-card']}>
              <div className={styles['fc-tag']}>نصيحة</div>
              <div className={styles['fc-title']}>استخدم كلمة مرور قوية</div>
              <div className={styles['fc-meta']}>🔐 مزيج من الأحرف والأرقام والرموز</div>
            </div>
            <div className={styles['featured-card']}>
              <div className={styles['fc-tag']}>تحذير</div>
              <div className={styles['fc-title']}>لا تشارك كلمة المرور</div>
              <div className={styles['fc-meta']}>🚫 لن نطلب منك كلمة المرور أبداً</div>
            </div>
            <div className={styles['featured-card']}>
              <div className={styles['fc-tag']}>معلومات</div>
              <div className={styles['fc-title']}>الرابط ينتهي خلال 30 دقيقة</div>
              <div className={styles['fc-meta']}>⏰ بعد ذلك سيتوجب طلب رابط جديد</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
