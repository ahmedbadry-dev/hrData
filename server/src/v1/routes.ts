import prisma from '@/config/db.config';
import { notificationsService } from '@/notifications/notifications.service';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { JobsService } from './modules/jobs/jobs.service';
import { JobsController } from './modules/jobs/jobs.controller';
import { UsersService } from './modules/users/users.service';
import { UsersController } from './modules/users/users.controller';
import { ApplicationsService } from './modules/applications/applications.service';
import { ApplicationsController } from './modules/applications/applications.controller';
import { AnalyticsService } from './modules/analytics/analytics.service';
import { AnalyticsController } from './modules/analytics/analytics.controller';
import { NotificationsService as AppNotificationsService } from './modules/notifications/notifications.service';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { jobsRoutes } from './modules/jobs/jobs.routes';
import { usersRoutes } from './modules/users/users.routes';
import { applicationsRoutes } from './modules/applications/applications.routes';
import { trackingRoutes } from './modules/tracking/tracking.routes';
import { TrackingService } from './modules/tracking/tracking.service';
import { TrackingController } from './modules/tracking/tracking.controller';
import { gmailRoutes } from './modules/gmail/gmail.routes';
import { GmailService } from './modules/gmail/gmail.service';
import { GmailController } from './modules/gmail/gmail.controller';
import { analyticsRoutes } from './modules/analytics/analytics.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';
import { scraperRoutes } from './modules/scraper/scraper.routes';
import { ScraperService } from './modules/scraper/scraper.service';
import { ScraperController } from './modules/scraper/scraper.controller';

export const v1Routes = () => {
  const router = Router();

  const authService = new AuthService(prisma, notificationsService);
  const authController = new AuthController(authService);
  const jobsService = new JobsService(prisma);
  const jobsController = new JobsController(jobsService);
  const usersService = new UsersService(prisma);
  const usersController = new UsersController(usersService);
  const applicationsService = new ApplicationsService(prisma);
  const applicationsController = new ApplicationsController(applicationsService);
  const analyticsService = new AnalyticsService(prisma);
  const analyticsController = new AnalyticsController(analyticsService);
  const appNotificationsService = new AppNotificationsService(prisma);
  const notificationsController = new NotificationsController(appNotificationsService);
  const trackingService = new TrackingService(prisma);
  const trackingController = new TrackingController(trackingService);
  const gmailService = new GmailService(prisma);
  const gmailController = new GmailController(gmailService);

  const scraperService = new ScraperService(prisma);
  const scraperController = new ScraperController(scraperService);

  const { adminRouter: adminNotificationsRouter, userRouter: userNotificationsRouter } =
    notificationsRoutes(notificationsController);

  router.use('/auth', authRoutes(authController));
  router.use('/jobs', jobsRoutes(jobsController));
  router.use('/track', trackingRoutes(trackingController));
  router.use('/admin/users', usersRoutes(usersController));
  router.use('/admin/analytics', analyticsRoutes(analyticsController));
  router.use('/admin/notifications', adminNotificationsRouter);
  router.use('/notifications', userNotificationsRouter);
  router.use('/applications', applicationsRoutes(applicationsController));
  router.use('/gmail', gmailRoutes(gmailController));
  router.use('/admin/scraper', scraperRoutes(scraperController));

  return router;
};
