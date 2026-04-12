import { useState } from 'react';
import { useRegisterMutation } from '@/modules/auth/api/mutations';
import { mapErrorToArabic } from '@/lib/error-mapper';
import styles from './RegisterModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export default function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const registerMutation = useRegisterMutation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'يرجى إدخال الاسم الأول';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'يرجى إدخال الاسم الأخير';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'يرجى إدخال رقم الجوال';
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'يرجى إدخال رقم جوال صحيح (05xxxxxxxx)';
    }

    if (!formData.password) {
      newErrors.password = 'يرجى إدخال كلمة المرور';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    try {
      await registerMutation.mutateAsync(formData);
      onLoginClick();
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
          <div className={styles.subtitle}>إنشاء حساب جديد</div>
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

          <div className={styles.row2}>
            <div className={styles.field}>
              <label>الاسم الأخير</label>
              <input
                type="text"
                name="lastName"
                placeholder="العمري"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? styles.inputError : ''}
              />
              {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
            </div>
            <div className={styles.field}>
              <label>الاسم الأول</label>
              <input
                type="text"
                name="firstName"
                placeholder="أحمد"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? styles.inputError : ''}
              />
              {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
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
              className={errors.email ? styles.inputError : ''}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
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
              className={errors.phone ? styles.inputError : ''}
            />
            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
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
              className={errors.password ? styles.inputError : ''}
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
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
