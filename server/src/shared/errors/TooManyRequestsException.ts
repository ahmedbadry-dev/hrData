import { AppError } from './AppError';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';

export class TooManyRequestsException extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS');
    this.name = 'TooManyRequestsException';
  }
}
