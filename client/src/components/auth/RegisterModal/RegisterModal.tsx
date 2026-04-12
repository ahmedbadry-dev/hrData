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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setIsRegistered(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setServerError(null);
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'الاسم يجب أن يكون حرفين على الأقل';
    }

    if (!email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
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

    // Split fullName into firstName + lastName
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    registerMutation.mutate(
      { firstName, lastName, email: email.trim(), phone: phone.trim() || '0500000000', password },
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
      onClick={() => { if (!registerMutation.isPending) onClose(); }}
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
            كُفُـؤ<em>.</em>
          </div>
          <div className={styles.subtitle}>
            {isRegistered ? 'تم بنجاح' : 'إنشاء حساب جديد'}
          </div>
        </div>

        <div className={styles.body}>
          {isRegistered ? (
            /* ═══ SUCCESS STATE ═══ */
            <div className={styles.successState} role="status">
              <div className={styles.successIcon}>🎉</div>
              <h3 className={styles.successTitle}>تم إنشاء حسابك بنجاح!</h3>
              <p className={styles.successBody}>
                لتفعيل حسابك، يرجى التوجه إلى بريدك الإلكتروني
                والنقر على رابط التحقق الذي أرسلناه إليك.
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
              {serverError && (
                <div className={styles.serverError} role="alert">
                  <span className={styles.serverErrorIcon}>⚠️</span>
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className={styles.field}>
                  <label>الاسم الكامل</label>
                  <input
                    type="text"
                    id="register-fullName"
                    placeholder="أحمد العمري"
                    value={fullName}
                    disabled={registerMutation.isPending}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                      if (serverError) setServerError(null);
                    }}
                    className={errors.fullName ? styles.inputError : ''}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'register-fullName-error' : undefined}
                  />
                  {errors.fullName && (
                    <span id="register-fullName-error" className={styles.fieldError} role="alert">
                      {errors.fullName}
                    </span>
                  )}
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
