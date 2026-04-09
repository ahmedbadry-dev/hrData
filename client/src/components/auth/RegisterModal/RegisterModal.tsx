import React from 'react';
import { cn } from '@/lib/utils';
import { Button, Input } from '@/components/ui';
import styles from './RegisterModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
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
          <div className={styles.subtitle}>إنشاء حساب جديد</div>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
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

          <Button variant="primary" fullWidth className={styles.submitButton}>
            إنشاء الحساب ←
          </Button>
        </form>

        <div className={styles.footer}>
          لديك حساب بالفعل؟{' '}
          <a
            href="#"
            className={styles.loginLink}
            onClick={(e) => {
              e.preventDefault();
              onLoginClick();
            }}
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    </div>
  );
}
