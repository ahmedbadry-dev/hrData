import { useEffect, useState } from 'react';
import { useLoginMutation } from '@/modules/auth/api/mutations';
import { authService } from '@/modules/auth/api/auth.service';
import { mapErrorToArabic } from '@/lib/error-mapper';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

const getBackendError = (err: unknown): string => {
  const axiosError = err as {
    response?: {
      data?: {
        message?: string;
        errors?: Array<{ field?: string; message?: string }>;
      };
    };
  };

  const fieldErrors = axiosError.response?.data?.errors ?? [];
  if (fieldErrors.length > 0) {
    const firstError = fieldErrors[0]?.message ?? '';
    return mapErrorToArabic(firstError || 'يرجى التحقق من البيانات المدخلة');
  }

  return mapErrorToArabic(axiosError.response?.data?.message || 'حدث خطأ');
};

export default function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const loginMutation = useLoginMutation();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const hasFieldError = Boolean(errors.email || errors.password);

  useEffect(() => {
    if (!isOpen) return;

    setMode('login');
    setErrors({});
    setForgotSuccess(null);
    setForgotLoading(false);
  }, [isOpen]);

  const validateLoginForm = (): boolean => {
    const nextErrors: ValidationErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'البريد الإلكتروني مطلوب';
    }

    if (!password) {
      nextErrors.password = 'كلمة المرور مطلوبة';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateLoginForm()) {
      return;
    }

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
      onClose();
    } catch (err) {
      setErrors({ general: getBackendError(err) });
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setForgotSuccess(null);

    if (!forgotEmail.trim()) {
      setErrors({ email: 'البريد الإلكتروني مطلوب' });
      return;
    }

    setForgotLoading(true);
    try {
      await authService.forgotPassword({ email: forgotEmail.trim() });
      setForgotSuccess('إذا كان البريد مسجلا لدينا فسيصل رابط إعادة تعيين كلمة المرور خلال دقائق.');
      setErrors({});
    } catch (err) {
      setErrors({ general: getBackendError(err) });
    } finally {
      setForgotLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
      dir="rtl"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className={styles.logoWrap}>
          <div className={styles.logo}>
            كُفُـؤ<em>.</em>
          </div>
          <div className={styles.subtitle}>
            {mode === 'login' ? 'تسجيل الدخول' : 'استعادة كلمة المرور'}
          </div>
        </div>

        <div className={styles.body}>
          {forgotSuccess && <div className={styles.success}>{forgotSuccess}</div>}

          {errors.general && (
            <div className={`${styles.error} show`}>
              <span>{errors.general}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className={styles.field}>
                <label>البريد الإلكتروني</label>
                <input
                  type="text"
                  name="email"
                  placeholder="بريدك الإلكتروني"
                  dir="ltr"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={errors.email || hasFieldError ? styles.inputError : ''}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>

              <div className={styles.field}>
                <label>كلمة المرور</label>
                <input
                  type="password"
                  name="password"
                  placeholder="********"
                  dir="ltr"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={errors.password || hasFieldError ? styles.inputError : ''}
                />
                {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
              </div>

              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => {
                  setMode('forgot');
                  setForgotEmail(email);
                  setErrors({});
                  setForgotSuccess(null);
                }}
              >
                نسيت كلمة المرور؟
              </button>

              <button
                className={styles.submitButton}
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'جاري الدخول...' : 'دخول ←'}
              </button>

              <div className={styles.switch}>
                ليس لديك حساب؟{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onRegisterClick();
                  }}
                >
                  إنشاء حساب
                </a>
              </div>
            </form>
          ) : (
            <>
              {!forgotSuccess && (
                <form onSubmit={handleForgotSubmit}>
                  <div className={styles.field}>
                    <label>البريد الإلكتروني</label>
                    <input
                      type="email"
                      name="forgotEmail"
                      placeholder="you@example.com"
                      dir="ltr"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={errors.email ? styles.inputError : ''}
                    />
                    {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                  </div>

                  <button className={styles.submitButton} type="submit" disabled={forgotLoading}>
                    {forgotLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                  </button>
                </form>
              )}

              <button
                type="button"
                className={styles.backLink}
                onClick={() => {
                  setMode('login');
                  setErrors({});
                  setForgotSuccess(null);
                }}
              >
                العودة لتسجيل الدخول
              </button>
            </>
          )}

          <div className={styles.hint}>
            <strong>تلميح:</strong> اسم المستخدم <code>user</code> · كلمة المرور <code>user</code>
          </div>
        </div>
      </div>
    </div>
  );
}
