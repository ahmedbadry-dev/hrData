import { useNavigate } from 'react-router-dom';
import { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui';
import styles from './ErrorFallback.module.css';

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetErrorBoundary();
    navigate('/');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>⚠️</div>

        <h1 className={styles.title}>حدث خطأ ما</h1>

        <p className={styles.message}>
          {(error as Error)?.message || 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
        </p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleReload}>
            إعادة تحميل
          </Button>
          <Button onClick={handleGoHome}>العودة للرئيسية</Button>
        </div>
      </div>
    </div>
  );
}
