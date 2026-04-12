import { Router } from 'express';

import prisma from '@/config/db.config';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { trackingRateLimitMiddleware } from '@/http/middlewares/rate-limit.middleware';
import { validateParamsMiddleware } from '@/http/middlewares/validation.middleware';
import { TrackTokenParamDtoSchema } from './dto/track-token-param.dto';

const router = Router();

const trackingService = new TrackingService(prisma);
const trackingController = new TrackingController(trackingService);

router.get(
  '/open/:token',
  trackingRateLimitMiddleware,
  validateParamsMiddleware(TrackTokenParamDtoSchema),
  trackingController.handlePixel
);

export default router;
