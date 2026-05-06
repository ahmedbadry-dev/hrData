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
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB just in case
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
