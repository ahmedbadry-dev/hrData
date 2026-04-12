import { useAuthContext } from '@/modules/auth/context';

export const useAuth = () => {
  const auth = useAuthContext();

  return {
    data: {
      user: auth.user,
      accessToken: auth.accessToken,
      isAuthenticated: auth.isAuthenticated,
      gmailConnected: auth.gmailConnected,
      gmailEmail: auth.gmailEmail,
    },
    isLoading: auth.isLoading,
    restoreSession: auth.restoreSession,
    restoreGmailConnection: auth.restoreGmailConnection,
    connectGmail: auth.connectGmail,
    disconnectGmail: auth.disconnectGmail,
    clearSession: auth.clearSession,
    setSession: auth.setSession,
  };
};
