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
  general?: string;
}

const getErrorMessage = (err: unknown): string => {
  const axiosError = err as {
    response?: {
      data?: {
        message?: string;
        errors?: Array<{ field?: string; message?: string }>;
      };
    };
  };

  const fieldErrors = axiosError.response?.data?.errors ?? [];
  if (fieldErrors.length > 0) {
    const firstError = fieldErrors[0]?.message ?? '';
    return mapErrorToArabic(firstError || 'يرجى التحقق من البيانات المدخلة');
  }

  return mapErrorToArabic(axiosError.response?.data?.message || 'حدث خطأ');
};

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasAnyFieldError = Boolean(
    errors.firstName || errors.lastName || errors.email || errors.phone || errors.password
  );

  const validateForm = (): boolean => {
    const nextErrors: ValidationErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName.trim()) nextErrors.lastName = 'الاسم الأخير مطلوب';

    if (!formData.email.trim()) {
      nextErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'البريد الإلكتروني غير صالح';
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'رقم الجوال مطلوب';
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      nextErrors.phone = 'رقم الجوال غير صالح (05xxxxxxxx)';
    }

    if (!formData.password) {
      nextErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    if (!validateForm()) return;

    try {
      await registerMutation.mutateAsync(formData);
      setSuccessMessage('تم إنشاء الحساب بنجاح، يرجى تفعيل حسابك من رابط البريد الإلكتروني');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '' });
    } catch (err) {
      setErrors({ general: getErrorMessage(err) });
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
          {successMessage ? (
            <div className={styles.successOnlyWrap}>
              <div className={styles.success}>{successMessage}</div>
            </div>
          ) : (
            <>
              {errors.general && (
                <div className={`${styles.error} show`}>
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>الاسم الأخير</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="العمري"
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, lastName: e.target.value }));
                        if (successMessage) setSuccessMessage(null);
                        if (errors.lastName)
                          setErrors((prev) => ({ ...prev, lastName: undefined }));
                      }}
                      className={errors.lastName || hasAnyFieldError ? styles.inputError : ''}
                    />
                    {errors.lastName && (
                      <span className={styles.fieldError}>{errors.lastName}</span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label>الاسم الأول</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="أحمد"
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, firstName: e.target.value }));
                        if (successMessage) setSuccessMessage(null);
                        if (errors.firstName)
                          setErrors((prev) => ({ ...prev, firstName: undefined }));
                      }}
                      className={errors.firstName || hasAnyFieldError ? styles.inputError : ''}
                    />
                    {errors.firstName && (
                      <span className={styles.fieldError}>{errors.firstName}</span>
                    )}
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, email: e.target.value }));
                      if (successMessage) setSuccessMessage(null);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={errors.email || hasAnyFieldError ? styles.inputError : ''}
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, phone: e.target.value }));
                      if (successMessage) setSuccessMessage(null);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    className={errors.phone || hasAnyFieldError ? styles.inputError : ''}
                  />
                  {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                </div>

                <div className={styles.field}>
                  <label>كلمة المرور</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="********"
                    dir="ltr"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }));
                      if (successMessage) setSuccessMessage(null);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={errors.password || hasAnyFieldError ? styles.inputError : ''}
                  />
                  {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                </div>

                <button
                  className={styles.submitButton}
                  type="submit"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب ←'}
                </button>
              </form>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
