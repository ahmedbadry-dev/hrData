import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const signAccessToken = (payload: { userId: string; role: string }): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const signRefreshToken = (payload: { userId: string }): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyToken = (token: string, secret: string): jwt.JwtPayload => {
  return jwt.verify(token, secret) as jwt.JwtPayload;
};
