import { cn } from '@/lib/utils';
import styles from './Avatar.module.css';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initial = name.trim().charAt(0) || '?';
  return <span className={cn(styles.avatar, styles[size], className)}>{initial}</span>;
}
