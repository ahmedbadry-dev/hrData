import { Link } from 'react-router-dom';
import styles from '@/pages/home/HomePage.module.css';
import { homeCta } from '@/components/home/sections/homeData';

export default function HomeCtaSection() {
  return (
    <section className={styles['cta-band']} id="cta">
      <div className={styles.reveal}>
        <div className={styles['cta-title']}>
          {homeCta.titleTop}
          <br />
          {homeCta.titleBottom}
        </div>
        <div className={styles['cta-sub']}>{homeCta.subtitle}</div>
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
