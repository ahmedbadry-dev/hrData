import { Link } from 'react-router-dom';
import styles from '@/pages/home/HomePage.module.css';
import { homeHeroCards, homeHeroStats } from '@/components/home/sections/homeData';

export default function HomeHeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles['hero-left']}>
        <div className={styles['hero-eyebrow']}>منصة التوظيف المباشر</div>
        <h1 className={styles['hero-headline']}>
          وظّف
          <br />
          <em>الكفاءات</em>
          <br />
          مباشرةً
        </h1>
        <p className={styles['hero-body']}>
          كُفُـؤ تربطك بأصحاب العمل مباشرةً عبر البريد الإلكتروني — بدون وسيط، بدون رسوم، بدون
          تعقيد. أرسل سيرتك الذاتية وانتظر ردهم.
        </p>
        <div className={styles['hero-cta-row']}>
          <Link className={styles['btn-primary']} to="/dashboard">
            ابدأ البحث الآن
          </Link>
          <a className={styles['btn-ghost']} href="#how">
            كيف يعمل؟
          </a>
        </div>

        <div className={styles['hero-stat-strip']}>
          {homeHeroStats.map((stat) => (
            <div key={stat.label}>
              <div className={styles['hero-stat-num']}>{stat.value}</div>
              <div className={styles['hero-stat-label']}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles['hero-right']}>
        <div className={styles['hero-stamp']}>
          توظيف
          <br />
          مباشر
          <br />
          ٢٠٢٦
        </div>

        <div>
          {homeHeroCards.map((card, index) => (
            <div
              key={`${card.company}-${card.role}`}
              className={`${styles['hero-card-preview']} ${index === 1 ? styles['hero-card-preview-secondary'] : ''}`}
            >
              <div className={styles['hcp-tag']}>{card.company}</div>
              <div className={styles['hcp-title']}>{card.role}</div>
              <div className={styles['hcp-meta']}>
                📍 {card.city} · 🎓 {card.major}
              </div>
              <div className={styles['hcp-email']}>📧 {card.email}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
