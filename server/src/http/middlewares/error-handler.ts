import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/shared/errors/AppError';
import logger from '@/shared/utils/logger.util';
import { env } from '@/config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`${err.code}: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: { code: err.code, status: err.statusCode },
    });
    return;
  }

  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: { code: 'VALIDATION_ERROR', status: 400 },
    });
    return;
  }

  logger.error(`${err.message}\n${err.stack}`);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    error: { code: 'INTERNAL_ERROR', status: 500 },
  });
};
