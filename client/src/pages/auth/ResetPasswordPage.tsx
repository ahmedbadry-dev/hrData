import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HomeNavbar from '@/components/home/layout/HomeNavbar/HomeNavbar';
import { authService } from '@/modules/auth/api/auth.service';
import { mapErrorToArabic } from '@/lib/error-mapper';
import styles from './AuthPages.module.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('رابط إعادة التعيين غير صالح');
      return;
    }

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, {
        password,
        confirmPassword,
      });

      setSuccess(response.message || 'تم تغيير كلمة المرور بنجاح');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const backendMessage = axiosError.response?.data?.message || 'فشل تغيير كلمة المرور';
      setError(mapErrorToArabic(backendMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl">
      <HomeNavbar />

      <main className={styles.pageContainer}>
        <section className={styles.authCard}>
          <div className={`${styles.iconWrap} ${styles.iconLoading}`}>🔐</div>
          <h1 className={styles.title}>إعادة تعيين كلمة المرور</h1>
          <p className={styles.subtitle}>أدخل كلمة مرور جديدة لحسابك</p>

          {error ? <p className={styles.errorText}>{error}</p> : null}
          {success ? <p className={styles.subtitle}>{success}</p> : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>كلمة المرور الجديدة</label>
              <input
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            <div className={styles.field}>
              <label>تأكيد كلمة المرور</label>
              <input
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type="password"
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            <div className={styles.actions}>
              <button className={styles.solidBtn} type="submit" disabled={isLoading}>
                {isLoading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
              </button>

              <button
                className={styles.outlineBtn}
                type="button"
                onClick={() => navigate('/?mode=login', { replace: true })}
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
