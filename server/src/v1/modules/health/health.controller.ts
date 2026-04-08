import { Request, Response, NextFunction } from 'express';
import { healthService } from './health.service';
import { sendSuccess } from '@/http/responses/success.response';

export const healthController = {
  getHealth(_req: Request, res: Response) {
    const data = healthService.getBasicHealth();
    sendSuccess(res, data, 'Server is running');
  },

  async getDatabaseHealth(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await healthService.getDatabaseHealth();
      sendSuccess(res, data, 'Database connected');
    } catch (error) {
      next(error);
    }
  },
};
