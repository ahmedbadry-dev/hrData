import { AppError } from './AppError';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';
import { FieldError } from '@/shared/utils/api-response';

export class BadRequestException extends AppError {
  constructor(message: string = 'Bad request', errors?: FieldError[]) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', true, errors);
    this.name = 'BadRequestException';
  }
}
