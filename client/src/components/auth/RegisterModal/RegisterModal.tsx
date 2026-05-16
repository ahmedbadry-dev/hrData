import { useEffect, useState } from 'react';
import { useRegisterMutation } from '@/modules/auth/api/mutations';
import { mapError } from '@/lib/error-mapper';
import styles from './RegisterModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function RegisterModal({ isOpen, onClose, onLoginClick }: RegisterModalProps) {
  const registerMutation = useRegisterMutation();

  const [isRegistered, setIsRegistered] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'unset';
      return;
    }
    
    document.body.style.overflow = 'hidden';
    setIsRegistered(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setServerError(null);

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب';
    }

    if (!firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }

    if (!email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!phone.trim()) {
      newErrors.phone = 'رقم الجوال مطلوب';
    } else if (!/^05\d{8}$/.test(phone.trim())) {
      newErrors.phone = 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 8 || !/\d/.test(password)) {
      newErrors.password = 'يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم واحد';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    registerMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      },
      {
        onSuccess: () => {
          setIsRegistered(true);
        },
        onError: (error) => {
          setServerError(mapError(error));
        },
      }
    );
  };

  const hasErrors = Object.values(errors).some((v) => Boolean(v));

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
      dir="rtl"
      onClick={() => {
        if (!registerMutation.isPending) onClose();
      }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          disabled={registerMutation.isPending}
          aria-label="إغلاق"
        >
          ✕
        </button>

        <div className={styles.logoWrap}>
          <div className={styles.logo}>
            <span className={styles.logoText}>HR Data</span>
          </div>
          <div className={styles.subtitle}>{isRegistered ? 'تم بنجاح' : 'إنشاء حساب جديد'}</div>
        </div>

        <div className={styles.body}>
          {isRegistered ? (
            /* ═══ SUCCESS STATE ═══ */
            <div className={styles.successState} role="status">
              <div className={styles.successIcon}>🎉</div>
              <h3 className={styles.successTitle}>تم إنشاء حسابك بنجاح!</h3>
              <p className={styles.successBody}>
                لتفعيل حسابك، يرجى التوجه إلى بريدك الإلكتروني والنقر على رابط التحقق الذي أرسلناه
                إليك.
              </p>
              <p className={styles.successHint}>
                💡 تحقق من مجلد البريد العشوائي (Spam) إذا لم تجد الرسالة.
              </p>
              <button className={styles.submitButton} onClick={onClose}>
                حسناً، فهمت
              </button>
            </div>
          ) : (
            /* ═══ REGISTER FORM ═══ */
            <>
              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label>الاسم الأول</label>
                    <input
                      type="text"
                      id="register-firstName"
                      placeholder="أحمد"
                      dir="rtl"
                      value={firstName}
                      disabled={registerMutation.isPending}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                        if (serverError) setServerError(null);
                      }}
                      className={errors.firstName ? styles.inputError : ''}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? 'register-firstName-error' : undefined}
                    />
                    {errors.firstName && (
                      <span
                        id="register-firstName-error"
                        className={styles.fieldError}
                        role="alert"
                      >
                        {errors.firstName}
                      </span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label>الاسم الأخير</label>
                    <input
                      type="text"
                      id="register-lastName"
                      placeholder="العمري"
                      dir="rtl"
                      value={lastName}
                      disabled={registerMutation.isPending}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                        if (serverError) setServerError(null);
                      }}
                      className={errors.lastName ? styles.inputError : ''}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? 'register-lastName-error' : undefined}
                    />
                    {errors.lastName && (
                      <span id="register-lastName-error" className={styles.fieldError} role="alert">
                        {errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className={styles.field}>
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="register-email"
                    placeholder="ahmed@email.com"
                    dir="ltr"
                    value={email}
                    disabled={registerMutation.isPending}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      if (serverError) setServerError(null);
                    }}
                    className={errors.email ? styles.inputError : ''}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'register-email-error' : undefined}
                  />
                  {errors.email && (
                    <span id="register-email-error" className={styles.fieldError} role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className={styles.field}>
                  <label>رقم الجوال</label>
                  <input
                    type="tel"
                    id="register-phone"
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    value={phone}
                    disabled={registerMutation.isPending}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      if (serverError) setServerError(null);
                    }}
                    className={errors.phone ? styles.inputError : ''}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'register-phone-error' : undefined}
                  />
                  {errors.phone && (
                    <span id="register-phone-error" className={styles.fieldError} role="alert">
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div className={styles.field}>
                  <label>كلمة المرور</label>
                  <input
                    type="password"
                    id="register-password"
                    placeholder="********"
                    dir="ltr"
                    value={password}
                    disabled={registerMutation.isPending}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      if (serverError) setServerError(null);
                    }}
                    className={errors.password ? styles.inputError : ''}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'register-password-error' : undefined}
                  />
                  {errors.password && (
                    <span id="register-password-error" className={styles.fieldError} role="alert">
                      {errors.password}
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.field}>
                  <label>تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    id="register-confirmPassword"
                    placeholder="********"
                    dir="ltr"
                    value={confirmPassword}
                    disabled={registerMutation.isPending}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      if (serverError) setServerError(null);
                    }}
                    className={errors.confirmPassword ? styles.inputError : ''}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword ? 'register-confirmPassword-error' : undefined
                    }
                  />
                  {errors.confirmPassword && (
                    <span
                      id="register-confirmPassword-error"
                      className={styles.fieldError}
                      role="alert"
                    >
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {serverError && (
                  <div className={styles.serverError} role="alert">
                    <span className={styles.serverErrorIcon}>⚠️</span>
                    <span>{serverError}</span>
                  </div>
                )}

                <button
                  className={styles.submitButton}
                  type="submit"
                  disabled={registerMutation.isPending || hasErrors}
                  aria-disabled={registerMutation.isPending || hasErrors}
                >
                  {registerMutation.isPending ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
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
