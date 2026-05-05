import { Router } from 'express';
import multer from 'multer';
import { authenticationMiddleware } from '../../../http/middlewares/auth.middleware';
import {
  validateParamsMiddleware,
  validateQueryMiddleware,
  validateBodyMiddleware,
} from '../../../http/middlewares/validation.middleware';
import { ScheduleApplicationsDtoSchema } from './dto/schedule-applications.dto';
import { ApplicationIdParamDtoSchema } from './dto/application-id-param.dto';
import { GetApplicationsDtoSchema } from './dto/get-applications.dto';
import { ApplicationsController } from './applications.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.stream || typeof file.stream.read !== 'function') {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    const chunks: Buffer[] = [];
    file.stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    file.stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46];
      const isPdf = PDF_MAGIC_BYTES.every((byte, i) => buffer[i] === byte);
      if (isPdf) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    });
    file.stream.on('error', () => cb(new Error('Only PDF files are allowed')));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const applicationsRoutes = (applicationsController: ApplicationsController): Router => {
  const router = Router();

  router.get(
    '/',
    authenticationMiddleware,
    validateQueryMiddleware(GetApplicationsDtoSchema),
    applicationsController.getApplications
  );

  router.get('/quota', authenticationMiddleware, applicationsController.getEmailQuota);

  router.get('/stats', authenticationMiddleware, applicationsController.getStats);

  router.get(
    '/:id',
    authenticationMiddleware,
    validateParamsMiddleware(ApplicationIdParamDtoSchema),
    applicationsController.getApplicationById
  );

  router.post(
    '/schedule',
    authenticationMiddleware,
    upload.single('cv'),
    validateBodyMiddleware(ScheduleApplicationsDtoSchema),
    applicationsController.scheduleApplications
  );

  router.delete(
    '/:id',
    authenticationMiddleware,
    validateParamsMiddleware(ApplicationIdParamDtoSchema),
    applicationsController.cancelApplication
  );

  return router;
};
