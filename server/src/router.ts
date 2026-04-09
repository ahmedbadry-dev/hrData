import { Router } from 'express';
import { v1Routes } from './v1/routes';
import { healthRoutes } from './v1/modules/health/health.routes';

const router = Router();

router.use('/health', healthRoutes());

router.use('/v1', v1Routes());

export default router;
