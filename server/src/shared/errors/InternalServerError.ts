import { AppError } from './AppError';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR', false);
    this.name = 'InternalServerError';
  }
}
