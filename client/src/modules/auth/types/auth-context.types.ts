import type { User } from '../api/auth.service';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  setSession: (session: { user: User; accessToken: string }) => void;
  clearSession: () => void;
  restoreSession: () => Promise<void>;
}
