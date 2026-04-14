import { Request, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { AnalyticsService } from './analytics.service';
import { ANALYTICS_MESSAGES } from './analytics.constants';
import { GetDailyStatsDto } from './dto/get-daily-stats.dto';
import { GetTopJobsDto } from './dto/get-top-jobs.dto';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getOverview = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.analyticsService.getOverviewStats();
    return ResponseHelper.ok(res, data, ANALYTICS_MESSAGES.OVERVIEW_FETCHED_SUCCESSFULLY, req.path);
  };

  getAdvancedOverview = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.analyticsService.getAdvancedOverview();
    return ResponseHelper.ok(
      res,
      data,
      ANALYTICS_MESSAGES.ADVANCED_OVERVIEW_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  getLoginsPerDay = async (req: Request, res: Response): Promise<Response> => {
    const { days } = req.query as unknown as GetDailyStatsDto['query'];
    const data = await this.analyticsService.getLoginsPerDay(days);
    return ResponseHelper.ok(
      res,
      data,
      ANALYTICS_MESSAGES.LOGINS_PER_DAY_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  getApplicationsPerDay = async (req: Request, res: Response): Promise<Response> => {
    const { days } = req.query as unknown as GetDailyStatsDto['query'];
    const data = await this.analyticsService.getApplicationsPerDay(days);
    return ResponseHelper.ok(
      res,
      data,
      ANALYTICS_MESSAGES.APPLICATIONS_PER_DAY_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  getEmailErrorsPerDay = async (req: Request, res: Response): Promise<Response> => {
    const { days } = req.query as unknown as GetDailyStatsDto['query'];
    const data = await this.analyticsService.getEmailErrorsPerDay(days);
    return ResponseHelper.ok(
      res,
      data,
      ANALYTICS_MESSAGES.EMAIL_ERRORS_PER_DAY_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  getUserActivityPerDay = async (req: Request, res: Response): Promise<Response> => {
    const { days } = req.query as unknown as GetDailyStatsDto['query'];
    const data = await this.analyticsService.getUserActivityPerDay(days);
    return ResponseHelper.ok(
      res,
      data,
      ANALYTICS_MESSAGES.USER_ACTIVITY_PER_DAY_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  getTopAppliedJobs = async (req: Request, res: Response): Promise<Response> => {
    const { limit } = req.query as unknown as GetTopJobsDto['query'];
    const data = await this.analyticsService.getTopAppliedJobs(limit);
    return ResponseHelper.ok(
      res,
      data,
      ANALYTICS_MESSAGES.TOP_APPLIED_JOBS_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  getApplicationStatusDistribution = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.analyticsService.getApplicationStatusDistribution();
    return ResponseHelper.ok(
      res,
      data,
      ANALYTICS_MESSAGES.APPLICATION_STATUS_DISTRIBUTION_FETCHED_SUCCESSFULLY,
      req.path
    );
  };
}
