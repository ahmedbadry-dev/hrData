import { Link } from 'react-router-dom';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeCtaSection() {
  return (
    <section className={styles['cta-band']} id="cta">
      <div className={styles.reveal}>
        <div className={styles['cta-title']}>
          مستعد تبدأ
          <br />
          رحلتك الوظيفية؟
        </div>
        <div className={styles['cta-sub']}>أكثر من ٢٠ وظيفة بانتظارك الآن من شركات موثوقة في المملكة</div>
      </div>
      <div className={styles['cta-buttons']}>
        <Link className={styles['btn-primary']} to="/dashboard">
          دخول لوحة التحكم ←
        </Link>
        <a className={styles['btn-ghost']} href="#how">
          اعرف أكثر
        </a>
      </div>
    </section>
  );
}
