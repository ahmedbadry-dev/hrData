import prisma from "@/config/db.config";
import { notificationsService } from "@/notifications/notifications.service";
import { AuthService } from "./modules/auth/auth.service";
import { AuthController } from "./modules/auth/auth.controller";
import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes";


export const v1Routes = () => {
  const router = Router();

  const authService = new AuthService(prisma, notificationsService);
  const authController = new AuthController(authService);

 

  // Mount v1 module routes here as you build them, e.g.:

  router.use('/auth', authRoutes(authController));

  // router.use('/tickets',  ticketRoutes());
  // router.use('/payments', paymentRoutes());
  // router.use('/categories', categoryRoutes());
  // router.use('/admin',    adminRoutes());
  // router.use('/media',    mediaRoutes());
  // router.use('/webhooks', webhookRoutes());

  return router;
};
