import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  symbol: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  symbolClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function EmptyState({
  symbol,
  title,
  description,
  action,
  className,
  symbolClassName,
  titleClassName,
  descriptionClassName,
}: EmptyStateProps) {
  return (
    <div className={cn(styles.emptyState, className)}>
      <div className={cn(styles.symbol, symbolClassName)}>{symbol}</div>
      <p className={cn(styles.title, titleClassName)}>{title}</p>
      {description ? (
        <p className={cn(styles.description, descriptionClassName)}>{description}</p>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
