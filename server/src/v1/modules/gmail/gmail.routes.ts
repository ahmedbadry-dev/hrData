import { Router } from 'express';
import { authenticationMiddleware } from '@/http/middlewares/auth.middleware';
import { validateQueryMiddleware } from '@/http/middlewares/validation.middleware';
import { GmailController } from './gmail.controller';
import { GmailCallbackDtoSchema } from './dto/gmail-callback.dto';

export const gmailRoutes = (gmailController: GmailController): Router => {
  const router = Router();

  router.get('/auth-url', authenticationMiddleware, gmailController.getAuthUrl);
  router.get(
    '/callback',
    validateQueryMiddleware(GmailCallbackDtoSchema),
    gmailController.handleCallback
  );
  router.get('/status', authenticationMiddleware, gmailController.getStatus);
  router.delete('/disconnect', authenticationMiddleware, gmailController.disconnect);

  return router;
};
