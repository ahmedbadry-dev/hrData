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
import { JobsController } from './jobs.controller';

export const jobsRoutes = (jobsController: JobsController): Router => {
  const router = Router();

  router.post(
    '/',
    authenticationMiddleware,
    validateBodyMiddleware(CreateJobDtoSchema),
    jobsController.createJob
  );

  router.post(
    '/bulk',
    authenticationMiddleware,
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

  router.delete(
    '/:id/save',
    authenticationMiddleware,
    validateParamsMiddleware(JobIdParamDtoSchema),
    jobsController.unsaveJob
  );

  return router;
};
