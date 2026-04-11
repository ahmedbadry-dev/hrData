import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { useRegisterMutation } from '@/modules/auth/api/mutations';
import { mapErrorToArabic } from '@/lib/error-mapper';
import styles from './RegisterModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await registerMutation.mutateAsync(formData);
      onClose();
      navigate('/');
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
          <div className={styles.subtitle}>إنشاء حساب جديد</div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>الاسم الأخير</label>
              <Input
                placeholder="العمري"
                className={styles.inputCustom}
                dir="rtl"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>الاسم الأول</label>
              <Input
                placeholder="أحمد"
                className={styles.inputCustom}
                dir="rtl"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>رقم الجوال</label>
            <Input
              type="tel"
              placeholder="05XXXXXXXX"
              className={styles.inputCustom}
              dir="ltr"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <Button
            variant="primary"
            fullWidth
            className={styles.submitButton}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب ←'}
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
