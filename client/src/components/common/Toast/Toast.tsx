import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import styles from './Toast.module.css';

export const Toast = () => {
  const { toast, hideToast } = useToast();

  useEffect(() => {
    if (!toast.visible) return;
    const id = window.setTimeout(hideToast, 3200);
    return () => window.clearTimeout(id);
  }, [toast.visible, hideToast]);

  return (
    <div
      className={cn(
        styles.toast,
        toast.visible && styles.show,
        toast.type === 'success' ? styles.success : styles.error
      )}
    >
      {toast.message}
    </div>
  );
};
