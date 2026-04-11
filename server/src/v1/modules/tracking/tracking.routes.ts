import { Router } from 'express';

import prisma from '@/config/db.config';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';

const router = Router();

const trackingService = new TrackingService(prisma);
const trackingController = new TrackingController(trackingService);

router.get('/open/:token', trackingController.handlePixel);

export default router;
