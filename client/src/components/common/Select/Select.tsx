import { cn } from '@/lib/utils';
import styles from './Select.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  containerClassName?: string;
  onValueChange?: (value: string) => void;
}

export function Select({
  options,
  containerClassName,
  className,
  onValueChange,
  ...props
}: SelectProps) {
  return (
    <div className={cn(styles.selectWrapper, containerClassName)}>
      <select
        className={cn(styles.select, className)}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className={styles.icon}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
