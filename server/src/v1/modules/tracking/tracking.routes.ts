import { Router } from 'express';
import { TrackingController } from './tracking.controller';
import { trackingRateLimitMiddleware } from '@/http/middlewares/rate-limit.middleware';
import { validateParamsMiddleware } from '@/http/middlewares/validation.middleware';
import { TrackTokenParamDtoSchema } from './dto/track-token-param.dto';

export const trackingRoutes = (trackingController: TrackingController): Router => {
  const router = Router();

  router.get(
    '/open/:token',
    trackingRateLimitMiddleware,
    validateParamsMiddleware(TrackTokenParamDtoSchema),
    trackingController.handlePixel
  );

  return router;
};
