import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onLoginClick?: () => void;
}

export default function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate error based on the requirements
    setError('يرجي ملء جميع الحقول');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
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
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>الاسم الأول</label>
            <Input
              placeholder="أحمد"
              className={styles.inputCustom}
              dir="rtl"
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
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>رقم الجوال</label>
          <Input
            type="tel"
            placeholder="05XXXXXXXX"
            className={styles.inputCustom}
            dir="ltr"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>كلمة المرور</label>
          <Input
            type="password"
            placeholder="********"
            className={styles.inputCustom}
            dir="ltr"
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          className={`${styles.submitButton} ${error ? styles.submitButtonError : ''}`}
          type="submit"
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

      {showToast && (
        <div className={styles.toast}>
          <span>يرجى ملء الحقول الإلزامية</span>
          <div className={styles.toastIcon}>✕</div>
        </div>
      )}
    </div>
  );
}
