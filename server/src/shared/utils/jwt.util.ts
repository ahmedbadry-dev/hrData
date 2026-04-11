import jwt, { type SignOptions } from 'jsonwebtoken';

const { JsonWebTokenError, TokenExpiredError } = jwt;
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
  TempTokenPayload,
  VerifiedToken,
} from '../../v1/modules/auth/types/auth.types';
import { jwtConfig } from '@/config/env.config';
import { UserRole } from 'generated/prisma';

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const accessToken = jwt.sign(
    {
      userId: payload.userId,
      tokenId: payload.tokenId,
      email: payload.email,
      role: payload.role,
      type: 'ACCESS',
    },
    jwtConfig.accessSecret,
    {
      expiresIn: jwtConfig.accessExpiresIn,
    } as SignOptions
  );
  return accessToken;
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const refreshToken = jwt.sign(
    {
      userId: payload.userId,
      tokenId: payload.tokenId,
      type: 'REFRESH',
    },
    jwtConfig.refreshSecret,
    {
      expiresIn: jwtConfig.refreshExpiresIn,
    } as SignOptions
  );
  return refreshToken;
};

export const generateTempToken = (payload: TempTokenPayload): string => {
  const verificationToken = jwt.sign(
    {
      email: payload.email,
      type: payload.type,
    },
    jwtConfig.verificationSecret,
    {
      expiresIn: jwtConfig.verificationExpiresIn,
    } as SignOptions
  );
  return verificationToken;
};

export const generateTokenPair = (payload: {
  userId: string;
  tokenId: string;
  role: UserRole;
  email: string;
}): TokenPair => {
  const accessToken = generateAccessToken({
    userId: payload.userId,
    tokenId: payload.tokenId,
    email: payload.email,
    role: payload.role,
    type: 'ACCESS',
  });
  const refreshToken = generateRefreshToken({
    userId: payload.userId,
    tokenId: payload.tokenId,
    type: 'REFRESH',
  });
  return { accessToken, refreshToken };
};

const verifyToken = <T extends object>(
  token: string,
  secret: string,
  tokenTypeLabel: string
): VerifiedToken<T> => {
  try {
    const payload = jwt.verify(token, secret) as T;
    return { valid: true, payload };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        valid: false,
        error: `${tokenTypeLabel} token has expired`,
      };
    } else if (error instanceof JsonWebTokenError) {
      return {
        valid: false,
        error: `Invalid ${tokenTypeLabel.toLowerCase()} token`,
      };
    }
    return { valid: false, error: 'Token verification failed' };
  }
};

export const verifyAccessToken = (token: string): VerifiedToken<AccessTokenPayload> =>
  verifyToken<AccessTokenPayload>(token, jwtConfig.accessSecret, 'Access');

export const verifyRefreshToken = (token: string): VerifiedToken<RefreshTokenPayload> =>
  verifyToken<RefreshTokenPayload>(token, jwtConfig.refreshSecret, 'Refresh');

export const verifyTempToken = (token: string): VerifiedToken<TempTokenPayload> =>
  verifyToken<TempTokenPayload>(token, jwtConfig.verificationSecret, 'Temporary');
