import prisma from "@/config/db.config";
import { notificationsService } from "@/notifications/notifications.service";
import { AuthService } from "./modules/auth/auth.service";
import { AuthController } from "./modules/auth/auth.controller";
import { JobsService } from './modules/jobs/jobs.service';
import { JobsController } from './modules/jobs/jobs.controller';
import { UsersService } from './modules/users/users.service';
import { UsersController } from './modules/users/users.controller';
import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { jobsRoutes } from './modules/jobs/jobs.routes';
import { usersRoutes } from './modules/users/users.routes';
import trackingRoutes from './modules/tracking/tracking.routes';

export const v1Routes = () => {
  const router = Router();

  const authService = new AuthService(prisma, notificationsService);
  const authController = new AuthController(authService);
  const jobsService = new JobsService(prisma);
  const jobsController = new JobsController(jobsService);
  const usersService = new UsersService(prisma);
  const usersController = new UsersController(usersService);

  router.use('/auth', authRoutes(authController));
  router.use('/jobs', jobsRoutes(jobsController));
  router.use('/track', trackingRoutes);
  router.use('/admin/users', usersRoutes(usersController));

  return router;
};
