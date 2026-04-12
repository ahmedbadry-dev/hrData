import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { openRegister } = useAuthModal();

  useEffect(() => {
    openRegister();
    navigate('/?mode=register', { replace: true });
  }, [navigate, openRegister]);

  return null;
}
