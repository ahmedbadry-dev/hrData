import { AppError } from './AppError';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';

export class ForbiddenException extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
    this.name = 'ForbiddenException';
  }
}
