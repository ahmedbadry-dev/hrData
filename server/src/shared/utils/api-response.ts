import { HTTP_STATUS } from '../constants/http-status.constants';

import { Response } from 'express';

export interface HTTPResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  paginationMeta?: PaginationMeta;
  timestamp: string;
  path: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorResponse extends HTTPResponse<null> {
  errors: FieldError[] | undefined;
  stack?: string | undefined;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message: string,
    statusCode: number,
    path: string
  ): Response {
    const paginationMeta =
      data &&
      typeof data === 'object' &&
      'pagination' in (data as Record<string, unknown>)
        ? ((data as { pagination?: PaginationMeta }).pagination ?? undefined)
        : undefined;

    const response: HTTPResponse<T> = {
      success: true,
      message,
      statusCode,
      data,
      ...(paginationMeta ? { paginationMeta } : {}),
      timestamp: new Date().toISOString(),
      path,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message: string, path: string): Response {
    return this.success(res, data, message, HTTP_STATUS.CREATED, path);
  }

  static ok<T>(res: Response, data: T, message: string, path: string): Response {
    return this.success(res, data, message, HTTP_STATUS.OK, path);
  }
}

export default ResponseHelper;
