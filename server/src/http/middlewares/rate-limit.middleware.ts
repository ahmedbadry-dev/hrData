import rateLimit from 'express-rate-limit';

import { APP_CONSTANTS } from '@/config/constants';

const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      statusCode: 429,
      message,
    },
  });
};

export const apiRateLimitMiddleware = createRateLimiter(
  APP_CONSTANTS.RATE_LIMIT_API.windowMs,
  APP_CONSTANTS.RATE_LIMIT_API.max,
  'Too many requests. Please try again later.'
);

export const authRateLimitMiddleware = createRateLimiter(
  APP_CONSTANTS.RATE_LIMIT_AUTH.windowMs,
  APP_CONSTANTS.RATE_LIMIT_AUTH.max,
  'Too many authentication attempts. Please try again later.'
);

export const trackingRateLimitMiddleware = createRateLimiter(
  APP_CONSTANTS.RATE_LIMIT_API.windowMs,
  Math.max(20, Math.floor(APP_CONSTANTS.RATE_LIMIT_API.max / 2)),
  'Too many tracking requests. Please try again later.'
);
