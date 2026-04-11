import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useRegisterMutation } from '@/modules/auth/api/mutations';
import { mapErrorToArabic } from '@/lib/error-mapper';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onLoginClick?: () => void;
}

export default function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !phone || !password) return;
    if (password.length < 8) return;

    try {
      await registerMutation.mutateAsync({ firstName, lastName, email, phone, password });
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || '';
      setError(mapErrorToArabic(message));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoPoint}>.</span> كُفُـؤ
        </div>
        <div className={styles.subtitle}>إنشاء حساب جديد</div>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>الاسم الأخير</label>
            <Input
              placeholder="العمري"
              className={styles.inputCustom}
              dir="rtl"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>الاسم الأول</label>
            <Input
              placeholder="أحمد"
              className={styles.inputCustom}
              dir="rtl"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>البريد الإلكتروني</label>
          <Input
            type="email"
            placeholder="ahmed@email.com"
            className={styles.inputCustom}
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>رقم الجوال</label>
          <Input
            type="tel"
            placeholder="05xxxxxxxx"
            className={styles.inputCustom}
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          className={`${styles.submitButton} ${error ? styles.submitButtonError : ''}`}
          type="submit"
          isLoading={registerMutation.isPending}
        >
          إنشاء الحساب ←
        </Button>
      </form>

      <div className={styles.footer}>
        لديك حساب بالفعل؟{' '}
        <Link to="/login" className={styles.loginLink} onClick={onLoginClick}>
          تسجيل الدخول
        </Link>
      </div>
    </div>
  );
}
