import { Spinner } from './Spinner';
import styles from './FullPageSpinner.module.css';

interface FullPageSpinnerProps {
  message?: string;
}

export function FullPageSpinner({ message }: FullPageSpinnerProps) {
  return (
    <div className={styles.fullPageSpinner} role="status" aria-live="polite">
      <Spinner size="lg" aria-label="جاري التحميل" />
      {message && <p className={styles.spinnerMessage}>{message}</p>}
    </div>
  );
}
