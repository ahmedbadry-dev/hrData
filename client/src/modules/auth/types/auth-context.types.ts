import type { User } from '../api/auth.service';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  gmailConnected: boolean;
  gmailEmail: string | null;
}

export interface AuthContextType extends AuthState {
  setSession: (session: { user: User; accessToken: string }) => void;
  clearSession: () => void;
  restoreSession: () => Promise<void>;
  restoreGmailConnection: () => Promise<void>;
  connectGmail: () => Promise<void>;
  disconnectGmail: () => Promise<void>;
}
