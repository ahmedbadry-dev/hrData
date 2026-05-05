import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeFeaturesSection() {
  return (
    <section className={`${styles.section} ${styles['features-section']}`} id="features">
      <div className={`${styles['section-tag']} ${styles['features-tag']}`}>المميزات</div>
      <div className={styles['section-title']}>لماذا HR Data؟</div>

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
            ابحث بالمسمى الوظيفي أو التخصص أو المدينة. نتائج فورية بدون انتظار وبدون إعلانات مزعجة.
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
            HR Data مجانية للباحثين عن عمل بالكامل — لا اشتراكات، لا رسوم خفية، لا إعلانات. فقط فرصة
            حقيقية.
          </div>
        </div>
      </div>
    </section>
  );
}
