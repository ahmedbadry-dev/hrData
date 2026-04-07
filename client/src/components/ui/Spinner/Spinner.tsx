import { cn } from '@/lib/utils';
import styles from './Spinner.module.css';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return <span className={cn(styles.spinner, styles[size], className)} aria-label="loading" />;
}
