import crypto from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

import { appConfig } from '@/config/env.config';
import { ForbiddenException } from '@/shared/errors/ForbiddenException';
import { AUTH_CONSTANTS } from '@/v1/modules/auth/auth.constants';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_EXEMPT_PATHS = new Set(['/api/v1/auth/login', '/api/v1/auth/register']);

const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const setCsrfCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_CONSTANTS.CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: false,
    secure: appConfig.isProduction,
    sameSite: 'strict',
    path: '/',
  });
};

export const csrfProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const existingToken = req.cookies[AUTH_CONSTANTS.CSRF_TOKEN_COOKIE_NAME] as string | undefined;
  const csrfToken = existingToken ?? generateCsrfToken();
  const hasExistingToken = Boolean(existingToken);

  if (!hasExistingToken) {
    setCsrfCookie(res, csrfToken);
  }

  const isMutationRequest = MUTATION_METHODS.has(req.method.toUpperCase());
  const hasRefreshTokenCookie = Boolean(req.cookies[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME]);
  const isCsrfExemptPath = CSRF_EXEMPT_PATHS.has(req.originalUrl.split('?')[0]);

  if (!isMutationRequest || isCsrfExemptPath || !hasRefreshTokenCookie) {
    next();
    return;
  }

  const requestCsrfToken = req.header(AUTH_CONSTANTS.CSRF_TOKEN_HEADER_NAME);
  if (!requestCsrfToken || requestCsrfToken !== csrfToken) {
    throw new ForbiddenException('Invalid CSRF token');
  }

  next();
};
