import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import styles from './Toast.module.css';

const typeClassMap: Record<string, string> = {
  success: styles.success,
  error: styles.error,
  info: styles.info,
};

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
        typeClassMap[toast.type] ?? styles.error
      )}
      role="status"
    >
      {toast.message}
    </div>
  );
};
