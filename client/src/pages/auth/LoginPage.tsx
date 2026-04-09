import { LoginForm } from '@/components/auth';
import styles from './AuthPages.module.css';

export default function LoginPage() {
  return (
    <div className={styles.pageContainer}>
      <LoginForm />
    </div>
  );
}
