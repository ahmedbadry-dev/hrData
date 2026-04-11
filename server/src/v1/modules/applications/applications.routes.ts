import { Router } from 'express';
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

export const applicationsRoutes = (applicationsController: ApplicationsController): Router => {
  const router = Router();

  router.get(
    '/',
    authenticationMiddleware,
    validateQueryMiddleware(GetApplicationsDtoSchema),
    applicationsController.getApplications
  );

  router.get(
    '/:id',
    authenticationMiddleware,
    validateParamsMiddleware(ApplicationIdParamDtoSchema),
    applicationsController.getApplicationById
  );

  router.post(
    '/schedule',
    authenticationMiddleware,
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
