import { Router, Request, Response } from 'express';
import healthRoutes from '@/v1/modules/health/health.routes';

const v1Router = Router();

v1Router.use('/health', healthRoutes);


export default v1Router;
