import { NextFunction, Request, RequestHandler, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { HTTP_STATUS } from '@/shared/constants/http-status.constants';
import { AnalyticsService } from './analytics.service';
import { ANALYTICS_MESSAGES } from './analytics.constants';
import { GetDailyStatsDtoSchema } from './dto/get-daily-stats.dto';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getOverview: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.analyticsService.getOverviewStats();
      ResponseHelper.success(
        res,
        data,
        ANALYTICS_MESSAGES.OVERVIEW_FETCHED_SUCCESSFULLY,
        HTTP_STATUS.OK,
        req.path
      );
    } catch (error) {
      next(error);
    }
  };

  getLoginsPerDay: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { query } = GetDailyStatsDtoSchema.parse({ query: req.query });
      const data = await this.analyticsService.getLoginsPerDay(query.days);
      ResponseHelper.success(
        res,
        data,
        ANALYTICS_MESSAGES.LOGINS_PER_DAY_FETCHED_SUCCESSFULLY,
        HTTP_STATUS.OK,
        req.path
      );
    } catch (error) {
      next(error);
    }
  };

  getApplicationsPerDay: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { query } = GetDailyStatsDtoSchema.parse({ query: req.query });
      const data = await this.analyticsService.getApplicationsPerDay(query.days);
      ResponseHelper.success(
        res,
        data,
        ANALYTICS_MESSAGES.APPLICATIONS_PER_DAY_FETCHED_SUCCESSFULLY,
        HTTP_STATUS.OK,
        req.path
      );
    } catch (error) {
      next(error);
    }
  };

  getEmailErrorsPerDay: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { query } = GetDailyStatsDtoSchema.parse({ query: req.query });
      const data = await this.analyticsService.getEmailErrorsPerDay(query.days);
      ResponseHelper.success(
        res,
        data,
        ANALYTICS_MESSAGES.EMAIL_ERRORS_PER_DAY_FETCHED_SUCCESSFULLY,
        HTTP_STATUS.OK,
        req.path
      );
    } catch (error) {
      next(error);
    }
  };
}
