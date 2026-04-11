import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/modules/auth/api/mutations';
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

export default function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

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
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ email: mapErrorToArabic(err?.message || 'حدث خطأ') });
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
          <div className={styles.subtitle}>تسجيل الدخول</div>
        </div>

        <div className={styles.body}>
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
            className={styles.submitButton}
            onClick={handleSubmit}
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

          <div className={styles.hint}>
            <strong>تلميح:</strong> اسم المستخدم <code>user</code> · كلمة المرور <code>user</code>
          </div>
        </div>
      </div>
    </div>
  );
}
