import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import LoginModal from '@/components/auth/LoginModal/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal/RegisterModal';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuthContext } from '@/modules/auth/context';

export default function AuthModals() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const {
    isLoginOpen,
    isRegisterOpen,
    isForgotPasswordOpen,
    closeAll,
    openRegister,
    openLogin,
    openForgotPassword,
  } = useAuthModal();

  const mode = searchParams.get('mode');

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
    if (isAuthenticated) {
      closeAll();
      return;
    }

    if (mode === 'login') {
      openLogin();
    } else if (mode === 'register') {
      openRegister();
    } else if (mode === 'forgot-password') {
      openForgotPassword();
    } else if (!mode) {
      // Only close if there's no mode param — don't interfere with programmatic opens
    }
  }, [isAuthenticated, mode, closeAll, openLogin, openRegister, openForgotPassword]);

  if (isAuthenticated) {
    return null;
  }

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

  const handleForgotPasswordClose = () => {
    closeAll();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('mode');
    navigateWithParams(nextParams);
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen || isForgotPasswordOpen}
        onClose={isForgotPasswordOpen ? handleForgotPasswordClose : handleLoginClose}
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
