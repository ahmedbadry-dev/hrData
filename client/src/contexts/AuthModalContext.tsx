import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuthContext } from '@/modules/auth/context';

type ModalType = 'login' | 'register' | 'forgotPassword' | null;

interface AuthModalContextType {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  isForgotPasswordOpen: boolean;
  closeAll: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
  openForgotPassword: () => void;
  closeForgotPassword: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const canShowAuthModals = !isAuthenticated && !isLoading;

  const isLoginOpen = canShowAuthModals && activeModal === 'login';
  const isRegisterOpen = canShowAuthModals && activeModal === 'register';
  const isForgotPasswordOpen = canShowAuthModals && activeModal === 'forgotPassword';

  useEffect(() => {
    if (isAuthenticated || isLoading) {
      setActiveModal(null);
    }
  }, [isAuthenticated, isLoading]);

  const openLogin = useCallback(() => {
    if (!canShowAuthModals) {
      return;
    }

    setActiveModal('login');
  }, [canShowAuthModals]);

  const closeLogin = useCallback(() => {
    setActiveModal((prev) => (prev === 'login' ? null : prev));
  }, []);

  const openRegister = useCallback(() => {
    if (!canShowAuthModals) {
      return;
    }

    setActiveModal('register');
  }, [canShowAuthModals]);

  const closeRegister = useCallback(() => {
    setActiveModal((prev) => (prev === 'register' ? null : prev));
  }, []);

  const openForgotPassword = useCallback(() => {
    if (!canShowAuthModals) {
      return;
    }

    setActiveModal('forgotPassword');
  }, [canShowAuthModals]);

  const closeForgotPassword = useCallback(() => {
    setActiveModal((prev) => (prev === 'forgotPassword' ? null : prev));
  }, []);

  const closeAll = useCallback(() => {
    setActiveModal(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoginOpen,
      isRegisterOpen,
      isForgotPasswordOpen,
      closeAll,
      openLogin,
      closeLogin,
      openRegister,
      closeRegister,
      openForgotPassword,
      closeForgotPassword,
    }),
    [
      isLoginOpen,
      isRegisterOpen,
      isForgotPasswordOpen,
      closeAll,
      openLogin,
      closeLogin,
      openRegister,
      closeRegister,
      openForgotPassword,
      closeForgotPassword,
    ]
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}
