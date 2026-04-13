import { Router } from 'express';
import { UserRole } from 'generated/prisma';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../../http/middlewares/auth.middleware';
import { validateQueryMiddleware } from '../../../http/middlewares/validation.middleware';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { GetDailyStatsDtoSchema } from './dto/get-daily-stats.dto';
import { ANALYTICS_ROUTES } from './analytics.constants';

const analyticsService = new AnalyticsService();
const analyticsController = new AnalyticsController(analyticsService);
const router = Router();

router.use(authenticationMiddleware);
router.use(authorizationMiddleware(UserRole.ADMIN));

router.get(ANALYTICS_ROUTES.GET_OVERVIEW, analyticsController.getOverview);
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

export default router;
