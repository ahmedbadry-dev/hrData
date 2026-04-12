import { Router } from 'express';
import { authenticationMiddleware } from '../../../http/middlewares/auth.middleware';
import {
  validateParamsMiddleware,
  validateQueryMiddleware,
  validateBodyMiddleware,
} from '../../../http/middlewares/validation.middleware';
import { GetJobsDtoSchema } from './dto/get-jobs.dto';
import { JobIdParamDtoSchema } from './dto/job-id-param.dto';
import { SearchJobsDtoSchema } from './dto/search-jobs.dto';
import { CreateJobDtoSchema } from './dto/create-job.dto';
import { CreateBulkJobsDtoSchema } from './dto/create-bulk-jobs.dto';
import { BulkSaveJobsDtoSchema } from './dto/bulk-save-jobs.dto';
import { BulkUnsaveJobsDtoSchema } from './dto/bulk-unsave-jobs.dto';
import { JobsController } from './jobs.controller';
import { UserRole } from 'generated/prisma';
import { authorizationMiddleware } from '@/http/middlewares/auth.middleware';

export const jobsRoutes = (jobsController: JobsController): Router => {
  const router = Router();

  router.post(
    '/',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateBodyMiddleware(CreateJobDtoSchema),
    jobsController.createJob
  );

  router.post(
    '/bulk',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateBodyMiddleware(CreateBulkJobsDtoSchema),
    jobsController.createBulkJobs
  );

  router.get(
    '/saved',
    authenticationMiddleware,
    validateQueryMiddleware(GetJobsDtoSchema),
    jobsController.getSavedJobs
  );

  router.get(
    '/search',
    authenticationMiddleware,
    validateQueryMiddleware(SearchJobsDtoSchema),
    jobsController.searchJobs
  );

  router.get(
    '/',
    authenticationMiddleware,
    validateQueryMiddleware(GetJobsDtoSchema),
    jobsController.getJobs
  );

  router.get(
    '/:id',
    authenticationMiddleware,
    validateParamsMiddleware(JobIdParamDtoSchema),
    jobsController.getJobById
  );

  router.post(
    '/:id/save',
    authenticationMiddleware,
    validateParamsMiddleware(JobIdParamDtoSchema),
    jobsController.saveJob
  );

  router.post(
    '/save/bulk',
    authenticationMiddleware,
    validateBodyMiddleware(BulkSaveJobsDtoSchema),
    jobsController.saveJobs
  );

  router.delete(
    '/:id/save',
    authenticationMiddleware,
    validateParamsMiddleware(JobIdParamDtoSchema),
    jobsController.unsaveJob
  );

  router.delete(
    '/save/bulk',
    authenticationMiddleware,
    validateBodyMiddleware(BulkUnsaveJobsDtoSchema),
    jobsController.unsaveJobs
  );

  return router;
};
