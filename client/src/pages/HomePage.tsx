import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reveals = root.querySelectorAll<HTMLElement>(`.${styles.reveal}`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.in);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles['home-page']} ref={rootRef}>
      <nav className={styles.nav}>
        <a className={styles['nav-logo']} href="#">
          كُفُـؤ<em>.</em>
        </a>
        <div className={styles['nav-links']}>
          <a className={styles['nav-link']} href="#how">
            كيف يعمل
          </a>
          <a className={styles['nav-link']} href="#features">
            المميزات
          </a>
          <a className={styles['nav-link']} href="#cta">
            للشركات
          </a>
          <Link className={styles['btn-login']} to="/dashboard">
            دخول لوحة التحكم ←
          </Link>
        </div>
      </nav>

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

      <section className={styles.section} id="how">
        <div className={styles['section-tag']}>كيف يعمل</div>
        <div className={styles['section-title']}>ثلاث خطوات وانتهينا</div>
        <div className={styles['steps-grid']}>
          <div className={`${styles.step} ${styles.reveal}`}>
            <div className={styles['step-num']}>01</div>
            <div className={styles['step-accent']} />
            <div className={styles['step-title']}>تصفّح الوظائف</div>
            <div className={styles['step-body']}>
              ابحث عن وظيفة تناسب تخصصك ومدينتك من بين عشرات الفرص المتاحة من شركات موثوقة في السوق
              السعودي.
            </div>
          </div>

          <div className={`${styles.step} ${styles.reveal}`}>
            <div className={styles['step-num']}>02</div>
            <div className={styles['step-accent']} />
            <div className={styles['step-title']}>تواصل مباشرةً</div>
            <div className={styles['step-body']}>
              أرسل سيرتك الذاتية مباشرةً على بريد الشركة — بدون نماذج معقدة أو انتظار طويل. تواصل
              شخصي وحقيقي.
            </div>
          </div>

          <div className={`${styles.step} ${styles.reveal}`}>
            <div className={styles['step-num']}>03</div>
            <div className={styles['step-accent']} />
            <div className={styles['step-title']}>احفظ ونظّم</div>
            <div className={styles['step-body']}>
              احفظ الوظائف التي تعجبك ونظّمها في قائمتك الشخصية. لا تفوّت أي فرصة واهتم بكل تفصيلة.
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles['features-section']}`} id="features">
        <div className={`${styles['section-tag']} ${styles['features-tag']}`}>المميزات</div>
        <div className={styles['section-title']}>لماذا كُفُـؤ؟</div>

        <div className={styles['features-layout']}>
          <div className={`${styles['feature-block']} ${styles.reveal}`}>
            <div className={styles['feature-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 6l10 7 10-7" />
              </svg>
            </div>
            <div className={styles['feature-title']}>تواصل مباشر بلا وسيط</div>
            <div className={styles['feature-body']}>
              بريد الشركة ظاهر مباشرةً — أرسل ومتابع بنفسك. لا حواجز، لا طوابير، لا أنظمة وسيطة تأخذ
              وقتك.
            </div>
          </div>

          <div className={`${styles['feature-block']} ${styles.reveal}`}>
            <div className={styles['feature-icon']}>
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className={styles['feature-title']}>حفظ ومتابعة ذكية</div>
            <div className={styles['feature-body']}>
              احفظ الوظائف التي تهمك وارجع لها في أي وقت. قائمتك الشخصية محفوظة في جهازك ومتاحة
              دائماً.
            </div>
          </div>

          <div className={`${styles['feature-block']} ${styles.reveal}`}>
            <div className={styles['feature-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div className={styles['feature-title']}>بحث سريع ودقيق</div>
            <div className={styles['feature-body']}>
              ابحث بالمسمى الوظيفي أو التخصص أو المدينة. نتائج فورية بدون انتظار وبدون إعلانات
              مزعجة.
            </div>
          </div>

          <div className={`${styles['feature-block']} ${styles.reveal}`}>
            <div className={styles['feature-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 9h12M6 15h12M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
                <path d="M12 2v20" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles['feature-title']}>مجاني تماماً</div>
            <div className={styles['feature-body']}>
              كُفُـؤ مجانية للباحثين عن عمل بالكامل — لا اشتراكات، لا رسوم خفية، لا إعلانات. فقط
              فرصة حقيقية.
            </div>
          </div>
        </div>
      </section>

      <section className={styles['quote-section']}>
        <div className={`${styles['quote-inner']} ${styles.reveal}`}>
          <span className={styles['quote-mark']}>"</span>
          <p className={styles['quote-text']}>
            السوق السعودي يحتاج منصة تُقرّب الكفاءات من أصحاب العمل — مباشرةً وبدون ضجيج.
          </p>
          <div className={styles['quote-author']}>فريق كُفُـؤ · ٢٠٢٦</div>
        </div>
      </section>

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

      <footer className={styles.footer}>
        <div className={styles['footer-logo']}>
          كُفُـؤ<em>.</em>
        </div>
        <div className={styles['footer-copy']}>© ٢٠٢٦ كُفُـؤ — جميع الحقوق محفوظة</div>
        <div className={styles['footer-links']}>
          <a className={styles['footer-link']} href="#">
            سياسة الخصوصية
          </a>
          <a className={styles['footer-link']} href="#">
            الشروط والأحكام
          </a>
          <a className={styles['footer-link']} href="#">
            تواصل معنا
          </a>
        </div>
      </footer>
    </div>
  );
}
