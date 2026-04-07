import styles from '@/pages/home/HomePage.module.css';
import { homeQuote } from '@/components/home/sections/homeData';

export default function HomeQuoteSection() {
  return (
    <section className={styles['quote-section']}>
      <div className={`${styles['quote-inner']} ${styles.reveal}`}>
        <span className={styles['quote-mark']}>"</span>
        <p className={styles['quote-text']}>{homeQuote.text}</p>
        <div className={styles['quote-author']}>{homeQuote.author}</div>
      </div>
    </section>
  );
}
