import { Router } from 'express';
import { healthController } from './health.controller';

export const healthRoutes = () => {
  const router = Router();

  router.get('/', healthController.getHealth);
  router.get('/db', healthController.getDatabaseHealth);

  return router;
};
