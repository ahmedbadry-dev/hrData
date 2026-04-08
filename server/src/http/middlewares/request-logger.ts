import { Request, Response, NextFunction } from 'express';
import logger from '@/shared/utils/logger.util';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} — ${res.statusCode}`);
  });
  next();
};
