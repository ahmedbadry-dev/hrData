export const ErrorCodes = {
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Resource not found' },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400, message: 'Validation failed' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401, message: 'Authentication required' },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: 'Insufficient permissions' },
  CONFLICT: { code: 'CONFLICT', status: 409, message: 'Resource already exists' },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'Internal server error' },
  DB_CONNECTION_ERROR: {
    code: 'DB_CONNECTION_ERROR',
    status: 503,
    message: 'Database connection failed',
  },
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Too many requests' },
  BAD_REQUEST: { code: 'BAD_REQUEST', status: 400, message: 'Bad request' },
  ACCOUNT_LOCKED: { code: 'ACCOUNT_LOCKED', status: 423, message: 'Account is locked' },
  EMAIL_NOT_VERIFIED: { code: 'EMAIL_NOT_VERIFIED', status: 403, message: 'Email not verified' },
  TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', status: 401, message: 'Token has expired' },
  INVALID_TOKEN: { code: 'INVALID_TOKEN', status: 401, message: 'Invalid token' },
} as const;
