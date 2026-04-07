import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
}

export function PageHeader({
  title,
  eyebrow,
  className,
  eyebrowClassName,
  titleClassName,
}: PageHeaderProps) {
  return (
    <div className={cn(styles.header, className)}>
      {eyebrow ? <div className={cn(styles.eyebrow, eyebrowClassName)}>{eyebrow}</div> : null}
      <div className={cn(styles.title, titleClassName)}>{title}</div>
    </div>
  );
}
