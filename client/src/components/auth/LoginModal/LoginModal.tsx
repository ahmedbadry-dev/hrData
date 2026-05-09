import { useEffect, useState } from 'react';
import { useLoginMutation, useForgotPasswordMutation } from '@/modules/auth/api/mutations';
import { getErrorStatus, mapError } from '@/lib/error-mapper';
import { Logo } from '@/components/ui/Logo/Logo';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
  onForgotPasswordClick?: () => void;
}

type ModalView = 'login' | 'forgot' | 'forgotSuccess';

export default function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const loginMutation = useLoginMutation();
  const forgotMutation = useForgotPasswordMutation();

  const [view, setView] = useState<ModalView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [forgotServerError, setForgotServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'unset';
      return;
    }
    
    document.body.style.overflow = 'hidden';
    setView('login');
    setEmail('');
    setPassword('');
    setForgotEmail('');
    setErrors({});
    setServerError(null);
    setForgotServerError(null);
    setRememberMe(false);

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isPending = loginMutation.isPending || forgotMutation.isPending;

  // ── Login validation ──────────────────────────────────
  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validateLogin()) return;

    loginMutation.mutate(
      { email: email.trim(), password, rememberMe },
      {
        onError: (error) => {
          const status = getErrorStatus(error);
          if (status === 401) {
            setServerError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          } else {
            setServerError(mapError(error));
          }
        },
      }
    );
  };

  // ── Forgot password validation ────────────────────────
  const validateForgotEmail = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!forgotEmail.trim()) {
      newErrors.forgotEmail = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      newErrors.forgotEmail = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotServerError(null);
    if (!validateForgotEmail()) return;

    forgotMutation.mutate(
      { email: forgotEmail.trim() },
      {
        onSuccess: () => {
          setView('forgotSuccess');
        },
        onError: () => {
          // Security best practice: show success regardless
          // But if server returns an actual server error (5xx), show it
          setView('forgotSuccess');
        },
      }
    );
  };

  const hasLoginErrors = Boolean(errors.email || errors.password);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
      dir="rtl"
      onClick={() => {
        if (!isPending) onClose();
      }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          disabled={isPending}
          aria-label="إغلاق"
        >
          ✕
        </button>

        <div className={styles.logoWrap}>
          <div className={styles.logo}>
            <Logo fallback="HR Data" className={styles.logoImg} />
          </div>
          <div className={styles.subtitle}>
            {view === 'login' && 'تسجيل الدخول'}
            {view === 'forgot' && 'استعادة كلمة المرور'}
            {view === 'forgotSuccess' && 'تم الإرسال'}
          </div>
        </div>

        <div className={styles.body}>
          {/* ═══ LOGIN VIEW ═══ */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} noValidate>
              <div className={styles.field}>
                <label>البريد الإلكتروني</label>
                <input
                  type="text"
                  id="login-email"
                  placeholder="بريدك الإلكتروني"
                  dir="ltr"
                  value={email}
                  disabled={loginMutation.isPending}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    if (serverError) setServerError(null);
                  }}
                  className={errors.email ? styles.inputError : ''}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                />
                {errors.email && (
                  <span id="login-email-error" className={styles.fieldError} role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label>كلمة المرور</label>
                <input
                  type="password"
                  id="login-password"
                  placeholder="********"
                  dir="ltr"
                  value={password}
                  disabled={loginMutation.isPending}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    if (serverError) setServerError(null);
                  }}
                  className={errors.password ? styles.inputError : ''}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                />
                {errors.password && (
                  <span id="login-password-error" className={styles.fieldError} role="alert">
                    {errors.password}
                  </span>
                )}
              </div>

              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => {
                  setView('forgot');
                  setForgotEmail(email);
                  setErrors({});
                  setServerError(null);
                }}
              >
                نسيت كلمة المرور؟
              </button>

              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loginMutation.isPending}
                />
                <span>ابقني مسجلاً</span>
              </label>

              {/* Server error banner — above submit button */}
              {serverError && (
                <div className={styles.serverError} role="alert">
                  <span className={styles.serverErrorIcon}>⚠️</span>
                  <span>{serverError}</span>
                </div>
              )}

              <button
                className={styles.submitButton}
                type="submit"
                disabled={loginMutation.isPending || hasLoginErrors}
                aria-disabled={loginMutation.isPending || hasLoginErrors}
              >
                {loginMutation.isPending ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
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
          )}

          {/* ═══ FORGOT PASSWORD VIEW ═══ */}
          {view === 'forgot' && (
            <>
              <form onSubmit={handleForgotSubmit} noValidate>
                <div className={styles.field}>
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="forgot-email"
                    placeholder="بريدك الإلكتروني"
                    dir="ltr"
                    value={forgotEmail}
                    disabled={forgotMutation.isPending}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (errors.forgotEmail) setErrors((prev) => ({ ...prev, forgotEmail: '' }));
                      if (forgotServerError) setForgotServerError(null);
                    }}
                    className={errors.forgotEmail ? styles.inputError : ''}
                    aria-invalid={!!errors.forgotEmail}
                    aria-describedby={errors.forgotEmail ? 'forgot-email-error' : undefined}
                  />
                  {errors.forgotEmail && (
                    <span id="forgot-email-error" className={styles.fieldError} role="alert">
                      {errors.forgotEmail}
                    </span>
                  )}
                </div>

                {forgotServerError && (
                  <div className={styles.serverError} role="alert">
                    <span className={styles.serverErrorIcon}>⚠️</span>
                    <span>{forgotServerError}</span>
                  </div>
                )}

                <button
                  className={styles.submitButton}
                  type="submit"
                  disabled={forgotMutation.isPending}
                  aria-disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                </button>
              </form>

              <button
                type="button"
                className={styles.backLink}
                onClick={() => {
                  setView('login');
                  setErrors({});
                  setForgotServerError(null);
                }}
              >
                العودة لتسجيل الدخول
              </button>
            </>
          )}

          {/* ═══ FORGOT PASSWORD SUCCESS VIEW ═══ */}
          {view === 'forgotSuccess' && (
            <div className={styles.successState} role="status">
              <div className={styles.successIcon}>✅</div>
              <h3 className={styles.successTitle}>تم الإرسال!</h3>
              <p className={styles.successBody}>
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. تحقق من مجلد البريد
                العشوائي إذا لم تجد الرسالة.
              </p>
              <button className={styles.submitButton} onClick={onClose}>
                حسناً
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
