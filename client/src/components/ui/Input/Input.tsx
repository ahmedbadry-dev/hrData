import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import styles from './Input.module.css';

type InputVariant = 'default' | 'search' | 'token';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  uiSize?: InputSize;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = 'default', uiSize = 'md', className, ...props },
  ref
) {
  return <input ref={ref} className={cn(styles.input, styles[variant], styles[uiSize], className)} {...props} />;
});
