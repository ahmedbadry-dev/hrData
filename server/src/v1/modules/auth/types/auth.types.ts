import { UserRole } from 'generated/prisma';
import { SafeUser } from '../../users/types/user.types';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'ACCESS';
  iat?: number;
  exp?: number;
}
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  type: 'REFRESH';
  iat?: number;
  exp?: number;
}
export interface TempTokenPayload {
  email: string;
  type: 'VERIFICATION' | 'PASSWORD_RESET' | 'TWO_FACTOR';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type VerifiedToken<T> =
  | { valid: true; payload: T }
  | { valid: false; error: string };

export interface AuthResponseWithTokens {
  user: SafeUser;
  tokens: TokenPair;
}

export interface AuthResponseWithTwoFactor {
  requestTwoFactor: boolean;
  twoFactorToken: string;
}

export interface AuthResponseWithoutTokens {
  user: SafeUser;
}

export interface DeviceInfo {
  ipAddress: string;
  userAgent: string;
  deviceName: string;
}

