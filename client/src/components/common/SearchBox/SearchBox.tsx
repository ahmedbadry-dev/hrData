import { type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  buttonLabel?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function SearchBox({
  value,
  placeholder,
  onChange,
  onSubmit,
  buttonLabel = 'بحث',
  className,
  inputClassName,
  buttonClassName,
}: SearchBoxProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form className={cn(styles.searchBox, className)} onSubmit={handleSubmit}>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        variant="search"
        className={cn(styles.input, inputClassName)}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        className={cn(styles.button, buttonClassName)}
      >
        {buttonLabel}
      </Button>
    </form>
  );
}
