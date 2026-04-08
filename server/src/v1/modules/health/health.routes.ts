import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

router.get('/', healthController.getHealth);
router.get('/db', healthController.getDatabaseHealth);

export default router;
