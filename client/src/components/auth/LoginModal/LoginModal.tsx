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
}

const getErrorMessage = (err: unknown): string => {
  const axiosError = err as { response?: { data?: { message?: string } } };
  const message = axiosError.response?.data?.message || '';
  return mapErrorToArabic(message);
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setMode('login');
    setPassword('');
    setErrors({});
    setForgotSuccess(null);
    setForgotLoading(false);
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم';
    }

    if (!password) {
      newErrors.password = 'يرجى إدخال كلمة المرور';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    try {
      await loginMutation.mutateAsync({ email, password });
      onClose();
    } catch (err) {
      setErrors({ email: getErrorMessage(err) });
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setForgotSuccess(null);

    if (!forgotEmail.trim()) {
      setErrors({ email: 'يرجى إدخال البريد الإلكتروني' });
      return;
    }

    setForgotLoading(true);
    try {
      const response = await authService.forgotPassword({ email: forgotEmail.trim() });
      setForgotSuccess(response.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك');
    } catch (err) {
      setErrors({ email: getErrorMessage(err) });
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

          {errors.email && (
            <div className={`${styles.error} show`}>
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
              <span>{errors.email}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>البريد الإلكتروني أو اسم المستخدم</label>
                <input
                  type="text"
                  name="email"
                  placeholder="admin أو بريدك الإلكتروني"
                  dir="ltr"
                  value={email}
                  onChange={handleChange}
                  className={errors.email ? styles.inputError : ''}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>

              <div className={styles.field}>
                <label>كلمة المرور</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  dir="ltr"
                  value={password}
                  onChange={handleChange}
                  className={errors.password ? styles.inputError : ''}
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
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className={styles.field}>
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  dir="ltr"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={errors.email ? styles.inputError : ''}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>

              <button className={styles.submitButton} type="submit" disabled={forgotLoading}>
                {forgotLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
              </button>

              <button
                type="button"
                className={styles.backLink}
                onClick={() => {
                  setMode('login');
                  setErrors({});
                }}
              >
                العودة إلى تسجيل الدخول
              </button>
            </form>
          )}

          <div className={styles.hint}>
            <strong>تلميح:</strong> اسم المستخدم <code>user</code> · كلمة المرور <code>user</code>
          </div>
        </div>
      </div>
    </div>
  );
}
