import { FieldError } from '@/shared/utils/api-response';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';

export class AppError extends Error {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean = true;
  public readonly errors: FieldError[] | undefined;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    errors?: FieldError[]
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
