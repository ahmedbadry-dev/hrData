import { useState } from 'react';
import { useLogo } from '@/hooks/useLogo';
import styles from './Logo.module.css';

interface LogoProps {
  fallback?: string;
  className?: string;
}

export function Logo({ fallback = 'HR Data', className }: LogoProps) {
  const { logoPath, isLoading } = useLogo();
  const [imgError, setImgError] = useState(false);

  if (isLoading) {
    return <span className={`${styles.fallback} ${className || ''}`}>{fallback}</span>;
  }

  if (logoPath && !imgError) {
    return <img src={logoPath} alt="Logo" className={`${styles.logoImg} ${className || ''}`} onError={() => setImgError(true)} />;
  }

  return <span className={`${styles.fallback} ${className || ''}`}>{fallback}</span>;
}
