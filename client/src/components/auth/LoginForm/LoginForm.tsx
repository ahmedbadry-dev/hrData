import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onRegisterClick?: () => void;
}

export default function LoginForm({ onRegisterClick }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate error based on the images provided
    setError('يرجى إدخال اسم المستخدم وكلمة المرور');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoPoint}>.</span> كُفُـؤ
        </div>
        <div >تسجيل الدخول</div>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>البريد الإلكتروني أو اسم المستخدم</label>
          <Input
            type="text"
            placeholder="admin أو بريدك الإلكتروني"
            className={styles.inputCustom}
            dir="rtl"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>كلمة المرور</label>
          <Input type="password" placeholder="********" className={styles.inputCustom} dir="ltr" />
        </div>

        <Button
          variant="primary"
          fullWidth
          className={`${styles.submitButton} ${error ? styles.submitButtonError : ''}`}
          type="submit"
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

      {showToast && (
        <div className={styles.toast}>
          <span>يرجى ملء الحقول الإلزامية</span>
          <div className={styles.toastIcon}>✕</div>
        </div>
      )}
    </div>
  );
}
