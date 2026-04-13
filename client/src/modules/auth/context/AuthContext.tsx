import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService, type User, type GmailStatusResponse } from '@/modules/auth/api/auth.service';
import {
  AUTH_REQUIRED_EVENT,
  getAccessToken,
  removeAccessToken,
  SESSION_HINT_COOKIE_NAME,
  setAccessToken as setAccessTokenInMemory,
} from '@/services/api';
import type { AuthContextType } from '@/modules/auth/types/auth-context.types';

const AuthContext = createContext<AuthContextType | null>(null);

const hasCookie = (cookieName: string): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|; )${escapedName}=`).test(document.cookie);
};

const clearSessionHintCookie = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${SESSION_HINT_COOKIE_NAME}=; Max-Age=0; path=/; SameSite=Strict`;
};

const hasSessionRestoreHint = (): boolean => {
  return Boolean(getAccessToken()) || hasCookie(SESSION_HINT_COOKIE_NAME);
};

interface AuthProviderProps {
  children: ReactNode;
}

// Module-level deduplication: prevents StrictMode double-fire from
// calling /auth/refresh twice (token rotation consumes the old token
// on the first call, so the second call would fail with 401).
let restorePromise: Promise<void> | null = null;

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken());
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(hasSessionRestoreHint);

  const applyGmailState = useCallback((status: GmailStatusResponse | null) => {
    setGmailConnected(Boolean(status?.connected));
    setGmailEmail(status?.email ?? null);
  }, []);

  const setSession = useCallback((session: { user: User; accessToken: string }) => {
    setAccessTokenInMemory(session.accessToken);
    setAccessToken(session.accessToken);
    setUser(session.user);
    setIsLoading(false);
  }, []);

  const clearSession = useCallback(() => {
    removeAccessToken();
    clearSessionHintCookie();
    setAccessToken(null);
    setUser(null);
    applyGmailState(null);
    setIsLoading(false);
  }, [applyGmailState]);

  const restoreGmailConnection = useCallback(async () => {
    try {
      const response = await authService.getGmailStatus();
      applyGmailState(response.data ?? null);
    } catch {
      applyGmailState(null);
    }
  }, [applyGmailState]);

  const restoreSession = useCallback(async () => {
    if (!hasSessionRestoreHint()) {
      setIsLoading(false);
      return;
    }

    // If a restore is already in flight (e.g. from StrictMode double-mount),
    // wait for the existing one instead of starting a second refresh call.
    if (restorePromise) {
      await restorePromise;
      return;
    }

    setIsLoading(true);

    restorePromise = (async () => {
      try {
        const response = await authService.refresh();
        const sessionUser = response.data?.user ?? null;
        const nextAccessToken = response.data?.tokens?.accessToken ?? null;

        if (!sessionUser || !nextAccessToken) {
          clearSession();
          return;
        }

        setSession({ user: sessionUser, accessToken: nextAccessToken });
        await restoreGmailConnection();
      } catch {
        clearSession();
      } finally {
        restorePromise = null;
      }
    })();

    await restorePromise;
  }, [clearSession, restoreGmailConnection, setSession]);

  const connectGmail = useCallback(async () => {
    const authUrlResponse = await authService.getGmailAuthUrl();
    const authUrl = authUrlResponse.data?.authUrl;

    if (authUrl) {
      window.location.assign(authUrl);
      return;
    }

    await restoreGmailConnection();
  }, [restoreGmailConnection]);

  const disconnectGmail = useCallback(async () => {
    await authService.disconnectGmail();
    applyGmailState(null);
  }, [applyGmailState]);

  // Restore session on mount. If StrictMode fires this twice,
  // the module-level restorePromise deduplication ensures only
  // one /auth/refresh call is made.
  useEffect(() => {
    void restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      gmailConnected,
      gmailEmail,
      setSession,
      clearSession,
      restoreSession,
      restoreGmailConnection,
      connectGmail,
      disconnectGmail,
    }),
    [
      user,
      accessToken,
      isLoading,
      gmailConnected,
      gmailEmail,
      setSession,
      clearSession,
      restoreSession,
      restoreGmailConnection,
      connectGmail,
      disconnectGmail,
    ]
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
