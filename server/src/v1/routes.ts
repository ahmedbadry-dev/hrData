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
import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { jobsRoutes } from './modules/jobs/jobs.routes';
import { usersRoutes } from './modules/users/users.routes';
import { applicationsRoutes } from './modules/applications/applications.routes';
import trackingRoutes from './modules/tracking/tracking.routes';
import { gmailRoutes } from './modules/gmail/gmail.routes';
import analyticsRouter from './modules/analytics/analytics.routes';
import {
  adminNotificationsRouter,
  userNotificationsRouter,
} from './modules/notifications/notifications.routes';

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

  // Mount v1 module routes here as you build them, e.g.:

  router.use('/auth', authRoutes(authController));
  router.use('/jobs', jobsRoutes(jobsController));
  router.use('/track', trackingRoutes);
  router.use('/admin/users', usersRoutes(usersController));
  router.use('/admin/analytics', analyticsRouter);
  router.use('/admin/notifications', adminNotificationsRouter);
  router.use('/notifications', userNotificationsRouter);
  router.use('/applications', applicationsRoutes(applicationsController));
  router.use('/gmail', gmailRoutes(prisma));

  return router;
};
