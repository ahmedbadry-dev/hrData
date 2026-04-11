import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginModal from '@/components/auth/LoginModal/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal/RegisterModal';
import { useAuthModal } from '@/contexts/AuthModalContext';

export default function AuthModals() {
  const [searchParams] = useSearchParams();
  const { isLoginOpen, isRegisterOpen, closeLogin, closeRegister, openRegister, openLogin } =
    useAuthModal();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'login') {
      openLogin();
    } else if (mode === 'register') {
      openRegister();
    }
  }, [searchParams, openLogin, openRegister]);

  const handleLoginClose = () => {
    closeLogin();
    window.history.pushState({}, '', '/');
  };

  const handleRegisterClose = () => {
    closeRegister();
    window.history.pushState({}, '', '/');
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={handleLoginClose}
        onRegisterClick={() => {
          closeLogin();
          openRegister();
          window.history.pushState({}, '', '/?mode=register');
        }}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={handleRegisterClose}
        onLoginClick={() => {
          closeRegister();
          openLogin();
          window.history.pushState({}, '', '/?mode=login');
        }}
      />
    </>
  );
}
