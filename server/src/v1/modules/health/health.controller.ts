import { Request, Response, NextFunction } from 'express';
import { healthService } from './health.service';
import ResponseHelper from '@/shared/utils/api-response';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';

export const healthController = {
  getHealth(req: Request, res: Response): Response {
    const data = healthService.getBasicHealth();
    return ResponseHelper.ok(res, data, 'Server is running', req.path);
  },

  async getDatabaseHealth(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = await healthService.getDatabaseHealth();
      return ResponseHelper.ok(res, data, 'Database connected', req.path);
    } catch (error) {
      next(error);
    }
  },
};
