import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import styles from './Select.module.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onValueChange?: (value: string) => void;
  containerClassName?: string;
  className?: string;
  placeholder?: string;
  scrollable?: boolean;
  maxVisibleItems?: number;
}

export function Select({
  options,
  value,
  onValueChange,
  containerClassName,
  className,
  placeholder,
  scrollable = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onValueChange?.(val);
    setIsOpen(false);
  };

  return (
    <div className={cn(styles.selectWrapper, containerClassName)} ref={containerRef}>
      <button
        type="button"
        className={cn(styles.select, className, isOpen && styles.isOpen)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
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
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className={cn(styles.dropdownList, scrollable && styles.scrollable)}>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={cn(styles.option, opt.value === value && styles.selectedOption)}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
