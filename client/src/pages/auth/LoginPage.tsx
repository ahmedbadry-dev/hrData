import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    openLogin();
    navigate('/');
  }, [navigate, openLogin]);

  return null;
}
