import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface AuthModalContextType {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  closeAll: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<'login' | 'register' | null>(null);

  const isLoginOpen = activeModal === 'login';
  const isRegisterOpen = activeModal === 'register';

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

  const closeAll = useCallback(() => {
    setActiveModal(null);
  }, []);

  const value = useMemo(
    () => ({
      isLoginOpen,
      isRegisterOpen,
      closeAll,
      openLogin,
      closeLogin,
      openRegister,
      closeRegister,
    }),
    [isLoginOpen, isRegisterOpen, closeAll, openLogin, closeLogin, openRegister, closeRegister]
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
