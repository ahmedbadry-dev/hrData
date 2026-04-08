import { HTTP_STATUS } from '../constants/http-status.constants';

import { Response } from 'express';

export interface HTTPResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
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

export interface PaginationResponse<T> extends HTTPResponse<T> {
  paginationMeta: PaginationMeta;
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message: string,
    statusCode: number,
    path: string
  ): Response {
    const response: HTTPResponse<T> = {
      success: true,
      message,
      statusCode,
      data,
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

  static error(
    res: Response,
    message: string,
    statusCode: number,
    path: string,
    errors?: FieldError[]
  ): Response {
    const response: ErrorResponse = {
      success: false,
      message,
      statusCode,
      errors: errors?.length ? errors : undefined,
      timestamp: new Date().toISOString(),
      path,
    };
    return res.status(statusCode).json(response);
  }

  static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  static paginated<T>(
    res: Response,
    data: T,
    message: string,
    statusCode: number,
    path: string,
    paginationMeta: PaginationMeta
  ): Response {
    const response: PaginationResponse<T> = {
      success: true,
      message,
      statusCode,
      data,
      timestamp: new Date().toISOString(),
      path,
      paginationMeta,
    };
    return res.status(statusCode).json(response);
  }
}

export default ResponseHelper;
