import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService, type User } from '@/modules/auth/api/auth.service';
import {
  AUTH_REQUIRED_EVENT,
  getAccessToken,
  removeAccessToken,
  setAccessToken as setAccessTokenInMemory,
} from '@/services/api';
import type { AuthContextType } from '@/modules/auth/types/auth-context.types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((session: { user: User; accessToken: string }) => {
    setAccessTokenInMemory(session.accessToken);
    setAccessToken(session.accessToken);
    setUser(session.user);
    setIsLoading(false);
  }, []);

  const clearSession = useCallback(() => {
    removeAccessToken();
    setAccessToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await authService.refresh();
      const sessionUser = response.data?.user ?? null;
      const nextAccessToken = response.data?.tokens?.accessToken ?? null;

      if (!sessionUser || !nextAccessToken) {
        clearSession();
        return;
      }

      setSession({ user: sessionUser, accessToken: nextAccessToken });
    } catch {
      clearSession();
    }
  }, [clearSession, setSession]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleAuthRequired = () => {
      clearSession();
    };

    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
  }, [clearSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isLoading,
      setSession,
      clearSession,
      restoreSession,
    }),
    [user, accessToken, isLoading, setSession, clearSession, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
