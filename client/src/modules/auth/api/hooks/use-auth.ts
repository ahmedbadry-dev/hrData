import { useAuthContext } from '@/modules/auth/context';

export const useAuth = () => {
  const auth = useAuthContext();

  return {
    data: {
      user: auth.user,
      accessToken: auth.accessToken,
      isAuthenticated: auth.isAuthenticated,
    },
    isLoading: auth.isLoading,
    restoreSession: auth.restoreSession,
    clearSession: auth.clearSession,
    setSession: auth.setSession,
  };
};
