import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

type BadgeVariant = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'accent';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({ children, variant = 'neutral', size = 'sm', className }: BadgeProps) {
  return <span className={cn(styles.badge, styles[variant], styles[size], className)}>{children}</span>;
}
