import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
          <div className={styles.subtitle}>إنشاء حساب جديد</div>
        </div>

        <div className={styles.body}>
          {error && (
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
              <span>{error}</span>
            </div>
          )}

          <div className={styles.row2}>
            <div className={styles.field}>
              <label>الاسم الأخير</label>
              <input
                type="text"
                name="lastName"
                placeholder="العمري"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>الاسم الأول</label>
              <input
                type="text"
                name="firstName"
                placeholder="أحمد"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              placeholder="ahmed@email.com"
              dir="ltr"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>رقم الجوال</label>
            <input
              type="tel"
              name="phone"
              placeholder="05XXXXXXXX"
              dir="ltr"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>كلمة المرور</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              dir="ltr"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب ←'}
          </button>

          <div className={styles.switch}>
            لديك حساب بالفعل؟{' '}
            <a
              href="#"
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
    </div>
  );
}
