import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  valueClassName?: string;
  titleClassName?: string;
  trendClassName?: string;
  isLoading?: boolean;
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
  isLoading = false,
}: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : null;
  const animatedValue = useCountUp(numericValue, isLoading || numericValue === null);
  const renderedValue = numericValue === null ? value : animatedValue;

  return (
    <div className={cn(styles.statCard, className)}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <div className={cn(styles.value, valueClassName)}>{renderedValue}</div>
      <div className={cn(styles.title, titleClassName)}>{title}</div>
      {trend ? (
        <div className={cn(styles.trend, styles[trend.direction], trendClassName)}>
          {trend.value}
        </div>
      ) : null}
    </div>
  );
}
