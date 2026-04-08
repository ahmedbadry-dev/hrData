import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  valueClassName?: string;
  titleClassName?: string;
  trendClassName?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
  valueClassName,
  titleClassName,
  trendClassName,
}: StatCardProps) {
  return (
    <div className={cn(styles.statCard, className)}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <div className={cn(styles.value, valueClassName)}>{value}</div>
      <div className={cn(styles.title, titleClassName)}>{title}</div>
      {trend ? (
        <div className={cn(styles.trend, styles[trend.direction], trendClassName)}>
          {trend.value}
        </div>
      ) : null}
    </div>
  );
}
