export const AUTH_CONSTANTS = {
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,
  REFRESH_TOKEN_COOKIE_NAME: 'refreshToken',
  REFRESH_TOKEN_COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
  REFRESH_TOKEN_COOKIE_OPTIONS: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
} as const;
