import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    openLogin();

    const fromPath =
      (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname ?? '/';
    const redirect = fromPath.startsWith('/') ? `&redirect=${encodeURIComponent(fromPath)}` : '';

    navigate(`/?mode=login${redirect}`, { replace: true });
  }, [location.state, navigate, openLogin]);

  return null;
}
