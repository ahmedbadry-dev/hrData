import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

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
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const isLoginOpen = activeModal === 'login';
  const isRegisterOpen = activeModal === 'register';
  const isForgotPasswordOpen = activeModal === 'forgotPassword';

  const openLogin = useCallback(() => {
    setActiveModal('login');
  }, []);

  const closeLogin = useCallback(() => {
    setActiveModal((prev) => (prev === 'login' ? null : prev));
  }, []);

  const openRegister = useCallback(() => {
    setActiveModal('register');
  }, []);

  const closeRegister = useCallback(() => {
    setActiveModal((prev) => (prev === 'register' ? null : prev));
  }, []);

  const openForgotPassword = useCallback(() => {
    setActiveModal('forgotPassword');
  }, []);

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
