import { useEffect } from 'react';
import clsx from 'clsx';
import styles from './AdminToast.module.css';

interface AdminToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onHide: () => void;
}

export default function AdminToast({ message, type, visible, onHide }: AdminToastProps) {
  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(onHide, 3200);
    return () => window.clearTimeout(id);
  }, [visible, onHide]);

  return (
    <div className={clsx(styles.toast, visible && styles.show, type === 'success' ? styles.success : styles.error)}>
      {message}
    </div>
  );
}
