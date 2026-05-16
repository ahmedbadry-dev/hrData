import { Router } from 'express';
import multer from 'multer';
import { UserRole } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../../http/middlewares/auth.middleware';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsDtoSchema } from './dto/settings.dto';
import { validateBodyMiddleware } from '../../../http/middlewares/validation.middleware';

export const settingsRoutes = (settingsController: SettingsController): Router => {
  const router = Router();

  router.get('/logo', settingsController.getLogo);

  router.use(authenticationMiddleware);
  router.use(authorizationMiddleware(UserRole.ADMIN));

  router.get('/', settingsController.getSettings);

  router.post('/', validateBodyMiddleware(SettingsDtoSchema), settingsController.saveSettings);

  return router;
};
