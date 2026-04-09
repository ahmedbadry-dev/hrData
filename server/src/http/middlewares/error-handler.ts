import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { AppError } from '@/shared/errors/AppError';
import { InternalServerError } from '@/shared/errors/InternalServerError';
import { UnauthorizedException } from '@/shared/errors/UnauthorizedException';
import { ErrorResponse, FieldError } from '@/shared/utils/api-response';
import { appConfig } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';
import jwt from 'jsonwebtoken';

const formatZodErrors = (error: ZodError): FieldError[] => {
  return error.issues.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

const handleOperationalError = (req: Request, error: AppError): ErrorResponse => {
  return {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors?.length ? error.errors : undefined,
    stack: appConfig.isDevelopment ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    path: req.path,
  };
};

export function errorHandlerMiddleware(
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ZodError) {
    const fieldErrors = formatZodErrors(error);
    appError = new AppError(
      'Validation failed',
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR',
      true,
      fieldErrors
    );
  } else if (
    error instanceof jwt.JsonWebTokenError ||
    error instanceof jwt.TokenExpiredError ||
    error instanceof jwt.NotBeforeError
  ) {
    appError = new UnauthorizedException('Invalid or expired token');
  } else {
    appError = new InternalServerError(error.message || 'An unexpected error occurred');
    if (error.stack) appError.stack = error.stack;
  }

  if (!appError.isOperational) {
    logger.error(`${appError.message}\n${appError.stack}`);
  }

  const response = handleOperationalError(req, appError);
  return res.status(appError.statusCode).json(response);
}

export const errorHandler = errorHandlerMiddleware;
