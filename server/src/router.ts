import { Router } from 'express';
import healthRoutes from '@/v1/modules/health/health.routes';
import { authRoutes } from '@/v1/modules/auth/auth.routes';
import prisma from '@/config/prisma';
import { AuthService } from '@/v1/modules/auth/auth.service';
import { AuthController } from '@/v1/modules/auth/auth.controller';

const v1Router = Router();

v1Router.use('/health', healthRoutes);

const authService = new AuthService(prisma);
const authController = new AuthController(authService);

v1Router.use('/auth', authRoutes(authController));

export default v1Router;
