import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './Button.module.css';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'gold'
  | 'icon'
  | 'link';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const sizeClass = variant === 'icon' ? undefined : styles[size];
  const lastClickTime = useRef<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    const now = Date.now();
    if (now - lastClickTime.current < 500) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    lastClickTime.current = now;
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        sizeClass,
        fullWidth && styles.fullWidth,
        isLoading && styles.loading,
        isDisabled && styles.disabled,
        className
      )}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
