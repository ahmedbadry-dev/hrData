import styles from '@/components/home/layout/HomeLayout/HomeLayout.module.css';

export default function HomeQuoteSection() {
  return (
    <section className={styles['quote-section']}>
      <div className={`${styles['quote-inner']} ${styles.reveal}`}>
        <span className={styles['quote-mark']}>"</span>
        <p className={styles['quote-text']}>
          السوق السعودي يحتاج منصة تُقرّب الكفاءات من أصحاب العمل — مباشرةً وبدون ضجيج.
        </p>
        <div className={styles['quote-author']}>فريق HR Data · ٢٠٢٦</div>
      </div>
    </section>
  );
}
