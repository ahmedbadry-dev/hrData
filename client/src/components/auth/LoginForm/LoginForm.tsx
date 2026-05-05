import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { Logo } from '@/components/ui/Logo/Logo';
import { useLoginMutation } from '@/modules/auth/api/mutations';
import { mapErrorToArabic } from '@/lib/error-mapper';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onRegisterClick?: () => void;
}

export default function LoginForm({ onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }

    if (!password) {
      setError('كلمة المرور مطلوبة');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password, rememberMe });
    } catch (err) {
      const axiosError = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Array<{ message?: string }>;
          };
        };
      };

      const fieldError = axiosError.response?.data?.errors?.[0]?.message;
      const message = fieldError || axiosError.response?.data?.message || '';
      setError(mapErrorToArabic(message));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Logo fallback="HR Data" className={styles.logoImg} />
        </div>
        <div>تسجيل الدخول</div>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>البريد الإلكتروني</label>
          <Input
            type="email"
            placeholder="بريدك الإلكتروني"
            className={styles.inputCustom}
            dir="rtl"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>كلمة المرور</label>
          <Input
            type="password"
            placeholder="********"
            className={styles.inputCustom}
            dir="ltr"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        <div className={styles.optionsRow}>
          <label className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loginMutation.isPending}
            />
            <span>ابقني مسجلاً</span>
          </label>
          <Link to="/forgot-password" className={styles.forgotLink}>
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button
          variant="primary"
          fullWidth
          className={`${styles.submitButton} ${error ? styles.submitButtonError : ''}`}
          type="submit"
          isLoading={loginMutation.isPending}
        >
          دخول ←
        </Button>
      </form>

      <div className={styles.footer}>
        ليس لديك حساب؟{' '}
        <Link to="/register" className={styles.registerLink} onClick={onRegisterClick}>
          إنشاء حساب
        </Link>
      </div>

      <div className={styles.adminHint}>
        <span className={styles.hintTitle}>تلميح الإدارة:</span>
        <span>اسم المستخدم</span>
        <span className={styles.hintTag}>admin</span>
        <span>·</span>
        <span>كلمة المرور</span>
        <span className={styles.hintTag}>admin</span>
      </div>
    </div>
  );
}
