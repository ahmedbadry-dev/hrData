export class AppError extends Error {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean = true;

  constructor(message: string, statusCode: number, code: string, isOperational: boolean = true) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
