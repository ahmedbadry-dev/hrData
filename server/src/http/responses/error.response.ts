import { Response } from 'express';

export const sendError = (
  res: Response,
  message: string,
  code: string,
  statusCode: number = 400
): void => {
  res.status(statusCode).json({ success: false, message, error: { code, status: statusCode } });
};
