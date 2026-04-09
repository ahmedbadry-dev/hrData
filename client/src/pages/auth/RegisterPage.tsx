import { RegisterForm } from '@/components/auth';
import styles from './AuthPages.module.css';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <RegisterForm onLoginClick={() => navigate('/login')} />
    </div>
  );
}
