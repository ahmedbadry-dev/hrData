import { type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import styles from './Toggle.module.css';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
  sliderClassName?: string;
}

export function Toggle({ className, sliderClassName, ...props }: ToggleProps) {
  return (
    <label className={cn(styles.toggle, className)}>
      <input type="checkbox" {...props} />
      <span className={cn(styles.slider, sliderClassName)} />
    </label>
  );
}
