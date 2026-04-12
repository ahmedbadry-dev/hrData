import { useNavigate } from 'react-router-dom';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuthContext } from '@/modules/auth/context';

export default function HomeCtaSection() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { isAuthenticated, isLoading } = useAuthContext();

  const handleCtaClick = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      sessionStorage.setItem('redirectAfterLogin', '/dashboard');
      openLogin();
    }
  };

  return (
    <section className={styles['cta-band']} id="cta">
      <div className={styles.reveal}>
        <div className={styles['cta-title']}>
          مستعد تبدأ
          <br />
          رحلتك الوظيفية؟
        </div>
        <div className={styles['cta-sub']}>
          أكثر من ٢٠ وظيفة بانتظارك الآن من شركات موثوقة في المملكة
        </div>
      </div>
      <div className={styles['cta-buttons']}>
        <button className={styles['btn-primary']} onClick={handleCtaClick}>
          دخول لوحة التحكم ←
        </button>
        <a className={styles['btn-ghost']} href="#how">
          اعرف أكثر
        </a>
      </div>
    </section>
  );
}
