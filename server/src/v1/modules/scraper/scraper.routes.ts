// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/v1/modules/scraper/scraper.routes.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Router } from 'express';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '@/http/middlewares/auth.middleware';
import { UserRole } from 'generated/prisma';
import { ScraperController } from './scraper.controller';

export const scraperRoutes = (scraperController: ScraperController): Router => {
  const router = Router();

  const adminOnly = [authenticationMiddleware, authorizationMiddleware(UserRole.ADMIN)];

  // GET  /api/v1/admin/scraper/status
  router.get('/status', ...adminOnly, scraperController.getStatus);

  // POST /api/v1/admin/scraper/start
  router.post('/start', ...adminOnly, scraperController.start);

  // POST /api/v1/admin/scraper/stop
  router.post('/stop', ...adminOnly, scraperController.stop);

  // POST /api/v1/admin/scraper/run-now
  router.post('/run-now', ...adminOnly, scraperController.runNow);

  return router;
};
