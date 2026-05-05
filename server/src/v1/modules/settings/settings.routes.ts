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

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const settingsRoutes = (settingsController: SettingsController): Router => {
  const router = Router();

  router.get('/logo', settingsController.getLogo);

  router.use(authenticationMiddleware);
  router.use(authorizationMiddleware(UserRole.ADMIN));

  router.post('/logo', upload.single('logo'), settingsController.uploadLogo);

  router.get('/', settingsController.getSettings);

  router.post('/', validateBodyMiddleware(SettingsDtoSchema), settingsController.saveSettings);

  return router;
};
