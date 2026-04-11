import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useLoginMutation } from '@/modules/auth/api/mutations';
import { mapErrorToArabic } from '@/lib/error-mapper';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

export default function LoginModal({ isOpen, onClose, onRegisterClick }: LoginModalProps) {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await loginMutation.mutateAsync({ email, password });
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      setError(mapErrorToArabic(err?.message || 'حدث خطأ'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className={styles.header}>
          <div className={styles.logo}>
            كُفُـؤ<span className={styles.logoPoint}>.</span>
          </div>
          <div className={styles.subtitle}>تسجيل الدخول</div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>البريد الإلكتروني</label>
            <Input
              type="email"
              placeholder="ahmed@email.com"
              className={styles.inputCustom}
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <Button
            variant="primary"
            fullWidth
            className={styles.submitButton}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'جاري الدخول...' : 'تسجيل الدخول ←'}
          </Button>
        </form>

        <div className={styles.footer}>
          ليس لديك حساب؟{' '}
          <a
            href="#"
            className={styles.registerLink}
            onClick={(e) => {
              e.preventDefault();
              onRegisterClick();
            }}
          >
            إنشاء حساب
          </a>
        </div>
      </div>
    </div>
  );
}
