import { Link } from 'react-router-dom';
import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

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
          <div>
            <div className={styles['hero-stat-num']}>٢٠+</div>
            <div className={styles['hero-stat-label']}>وظيفة متاحة</div>
          </div>
          <div>
            <div className={styles['hero-stat-num']}>١٠</div>
            <div className={styles['hero-stat-label']}>شركة مشاركة</div>
          </div>
          <div>
            <div className={styles['hero-stat-num']}>١٠٠٪</div>
            <div className={styles['hero-stat-label']}>تواصل مباشر</div>
          </div>
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
          <div className={styles['hero-card-preview']}>
            <div className={styles['hcp-tag']}>مجموعة شاكر</div>
            <div className={styles['hcp-title']}>أخصائي مبيعات</div>
            <div className={styles['hcp-meta']}>📍 الرياض · 🎓 إدارة أعمال</div>
            <div className={styles['hcp-email']}>📧 recruitment@shaker.com</div>
          </div>
          <div className={`${styles['hero-card-preview']} ${styles['hero-card-preview-secondary']}`}>
            <div className={styles['hcp-tag']}>شركة التقنية</div>
            <div className={styles['hcp-title']}>مطور برمجيات</div>
            <div className={styles['hcp-meta']}>📍 جدة · 🎓 علوم حاسب</div>
            <div className={styles['hcp-email']}>📧 hr@tech.com</div>
          </div>
        </div>
      </div>
    </section>
  );
}
