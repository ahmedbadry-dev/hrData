import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../../http/middlewares/auth.middleware';
import { validateQueryMiddleware } from '../../../http/middlewares/validation.middleware';
import { AnalyticsController } from './analytics.controller';
import { GetDailyStatsDtoSchema } from './dto/get-daily-stats.dto';
import { GetTopJobsDtoSchema } from './dto/get-top-jobs.dto';
import { ANALYTICS_ROUTES } from './analytics.constants';

export const analyticsRoutes = (analyticsController: AnalyticsController): Router => {
  const router = Router();

  router.use(authenticationMiddleware);
  router.use(authorizationMiddleware(UserRole.ADMIN));

  router.get(ANALYTICS_ROUTES.GET_OVERVIEW, analyticsController.getOverview);
  router.get(ANALYTICS_ROUTES.GET_ADVANCED_OVERVIEW, analyticsController.getAdvancedOverview);
  router.get(
    ANALYTICS_ROUTES.GET_LOGINS_PER_DAY,
    validateQueryMiddleware(GetDailyStatsDtoSchema),
    analyticsController.getLoginsPerDay
  );
  router.get(
    ANALYTICS_ROUTES.GET_APPLICATIONS_PER_DAY,
    validateQueryMiddleware(GetDailyStatsDtoSchema),
    analyticsController.getApplicationsPerDay
  );
  router.get(
    ANALYTICS_ROUTES.GET_EMAIL_ERRORS_PER_DAY,
    validateQueryMiddleware(GetDailyStatsDtoSchema),
    analyticsController.getEmailErrorsPerDay
  );
  router.get(
    ANALYTICS_ROUTES.GET_USER_ACTIVITY_PER_DAY,
    validateQueryMiddleware(GetDailyStatsDtoSchema),
    analyticsController.getUserActivityPerDay
  );
  router.get(
    ANALYTICS_ROUTES.GET_TOP_JOBS,
    validateQueryMiddleware(GetTopJobsDtoSchema),
    analyticsController.getTopAppliedJobs
  );
  router.get(
    ANALYTICS_ROUTES.GET_APPLICATION_STATUS_DISTRIBUTION,
    analyticsController.getApplicationStatusDistribution
  );
  router.get(ANALYTICS_ROUTES.GET_RECENT_ACTIVITY_LOGS, analyticsController.getRecentActivityLogs);

  return router;
};
