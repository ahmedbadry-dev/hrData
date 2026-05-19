import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import styles from './SearchableSelect.module.css';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
}

export default function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'اختر من القائمة...',
  containerClassName,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Synchronize and restore input text when value changes or when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(selectedOption ? selectedOption.label : '');
      setActiveIndex(-1);
    }
  }, [isOpen, value, selectedOption]);

  // Filter options based on search term
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    onValueChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelect(filteredOptions[activeIndex]);
        } else if (filteredOptions.length > 0) {
          // If no item highlighted but enter is pressed, select first matched
          handleSelect(filteredOptions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className={cn(styles['select-container'], containerClassName)} ref={containerRef}>
      <div className={styles['input-wrapper']}>
        <input
          ref={inputRef}
          type="text"
          className={styles['select-input']}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <div
          className={styles['arrow-indicator']}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              inputRef.current?.focus();
            }
          }}
        >
          <svg
            className={cn(styles['chevron-icon'], isOpen && styles['chevron-rotated'])}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <ul className={styles['dropdown-list']}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <li
                key={option.value}
                className={cn(
                  styles['dropdown-item'],
                  option.value === value && styles['selected'],
                  idx === activeIndex && styles['active']
                )}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className={styles['no-results']}>لا توجد نتائج مطابقة</li>
          )}
        </ul>
      )}
    </div>
  );
}
