import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeHowSection() {
  return (
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
            أرسل سيرتك الذاتية مباشرةً على بريد الشركة — بدون نماذج معقدة أو انتظار طويل. تواصل شخصي
            وحقيقي.
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
  );
}
