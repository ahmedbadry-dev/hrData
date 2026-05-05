import { Logo } from '@/components/ui/Logo/Logo';
import styles from './SplashLoader.module.css';

interface SplashLoaderProps {
  message?: string;
}

export function SplashLoader({ message }: SplashLoaderProps) {
  return (
    <div className={styles.splashOverlay} role="status" aria-live="polite">
      <div className={styles.splashContent}>
        <div className={styles.logoContainer}>
          <div className={styles.logoRing}></div>
          <Logo fallback="HR Data" className={styles.logoSymbol} />
        </div>

        <Logo fallback="HR Data" className={styles.wordKafu} />

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}
