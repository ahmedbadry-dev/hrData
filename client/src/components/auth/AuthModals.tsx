import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import LoginModal from '@/components/auth/LoginModal/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal/RegisterModal';
import { useAuthModal } from '@/contexts/AuthModalContext';

export default function AuthModals() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoginOpen, isRegisterOpen, closeAll, openRegister, openLogin } = useAuthModal();

  const navigateWithParams = (params: URLSearchParams) => {
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : '',
      },
      { replace: true }
    );
  };

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'login') {
      openLogin();
    } else if (mode === 'register') {
      openRegister();
    }
  }, [searchParams, openLogin, openRegister]);

  const handleLoginClose = () => {
    closeAll();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('mode');
    nextParams.delete('redirect');
    navigateWithParams(nextParams);
  };

  const handleRegisterClose = () => {
    closeAll();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('mode');
    nextParams.delete('redirect');
    navigateWithParams(nextParams);
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleLoginClose}
        onRegisterClick={() => {
          openRegister();
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set('mode', 'register');
          navigateWithParams(nextParams);
        }}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={handleRegisterClose}
        onLoginClick={() => {
          openLogin();
          const nextParams = new URLSearchParams(searchParams);
          nextParams.set('mode', 'login');
          navigateWithParams(nextParams);
        }}
      />
    </>
  );
}
