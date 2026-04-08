import { AppError } from './AppError';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';

export class UnauthorizedException extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    this.name = 'UnauthorizedException';
  }
}
