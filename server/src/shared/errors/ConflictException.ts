import { AppError } from './AppError';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';

export class ConflictException extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, HTTP_STATUS.CONFLICT, 'CONFLICT');
    this.name = 'ConflictException';
  }
}
