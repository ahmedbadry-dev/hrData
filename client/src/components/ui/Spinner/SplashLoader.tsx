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
          <div className={styles.logoSymbol}>HR Data</div>
        </div>

        <h1 className={styles.wordKafu}>HR Data</h1>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}
