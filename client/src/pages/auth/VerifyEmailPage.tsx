import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import HomeNavbar from '@/components/home/layout/HomeNavbar/HomeNavbar';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('رابط التحقق غير صالح');
      return;
    }

    fetch('/api/v1/auth/verify-email?token=' + token, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage('تم التحقق من بريدك الإلكتروني بنجاح!');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'فشل التحقق من البريد الإلكتروني');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('حدث خطأ في الاتصال بالخادم');
      });
  }, [token, navigate]);

  return (
    <div className={styles['home-page']}>
      <HomeNavbar />
      <main
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--paper)',
            border: '2px solid var(--ink)',
            borderRadius: '4px',
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '8px 8px 0 var(--ink)',
          }}
        >
          {status === 'loading' && (
            <>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 24px',
                  background: 'var(--cream)',
                  border: '2px solid var(--ink)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}
              >
                ✉️
              </div>
              <h1
                style={{
                  color: 'var(--ink)',
                  fontSize: '28px',
                  fontWeight: '900',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px',
                }}
              >
                جاري التحقق...
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '24px' }}>
                يرجى الانتظار بينما نتحقق من بريدك الإلكتروني
              </p>
              <Spinner />
            </>
          )}

          {status === 'success' && (
            <>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 24px',
                  background: 'var(--accent2)',
                  border: '2px solid var(--ink)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                }}
              >
                ✓
              </div>
              <h1
                style={{
                  color: 'var(--ink)',
                  fontSize: '28px',
                  fontWeight: '900',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px',
                }}
              >
                تم التحقق بنجاح!
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '16px' }}>
                {message}
              </p>
              <p style={{ color: 'var(--warm)', fontSize: '13px' }}>
                سيتم توجيهك لتسجيل الدخول خلال 3 ثوانٍ...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 24px',
                  background: 'var(--accent)',
                  border: '2px solid var(--ink)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'var(--paper)',
                }}
              >
                !
              </div>
              <h1
                style={{
                  color: 'var(--ink)',
                  fontSize: '28px',
                  fontWeight: '900',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px',
                }}
              >
                فشل التحقق
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '32px' }}>
                {message}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link
                  to="/login"
                  className={styles['btn-register']}
                  style={{
                    background: 'var(--ink)',
                    color: 'var(--paper)',
                    padding: '14px 32px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className={styles['btn-login-navbar']}
                  style={{
                    padding: '12px 32px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  إنشاء حساب
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
