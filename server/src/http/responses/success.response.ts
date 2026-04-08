import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendPaginatedSuccess = (
  res: Response,
  data: unknown[],
  meta: { page: number; limit: number; total: number; totalPages: number },
  message: string = 'Success'
): void => {
  res.status(200).json({ success: true, message, data, meta });
};
