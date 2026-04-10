import { Request, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { GetJobsDto } from './dto/get-jobs.dto';
import { JobIdParamDto } from './dto/job-id-param.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateBulkJobsDto } from './dto/create-bulk-jobs.dto';
import { JobsService } from './jobs.service';
import { JOBS_CONSTANTS } from './jobs.constants';

export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  getJobs = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.jobsService.getJobs(req.user!.id, req.query as GetJobsDto['query']);
    return ResponseHelper.ok(res, data, JOBS_CONSTANTS.MESSAGES.JOBS_FETCHED_SUCCESSFULLY, req.path);
  };

  getJobById = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.jobsService.getJobById(
      req.user!.id,
      (req.params as JobIdParamDto['params']).id
    );
    return ResponseHelper.ok(res, data, JOBS_CONSTANTS.MESSAGES.JOB_FETCHED_SUCCESSFULLY, req.path);
  };

  getSavedJobs = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.jobsService.getSavedJobs(req.user!.id, req.query as GetJobsDto['query']);
    return ResponseHelper.ok(
      res,
      data,
      JOBS_CONSTANTS.MESSAGES.SAVED_JOBS_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  searchJobs = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.jobsService.searchJobs(req.user!.id, req.query as SearchJobsDto['query']);
    return ResponseHelper.ok(res, data, JOBS_CONSTANTS.MESSAGES.JOBS_FETCHED_SUCCESSFULLY, req.path);
  };

  saveJob = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.jobsService.saveJob(req.user!.id, (req.params as JobIdParamDto['params']).id);
    return ResponseHelper.created(res, data, JOBS_CONSTANTS.MESSAGES.JOB_SAVED_SUCCESSFULLY, req.path);
  };

  createJob = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.jobsService.createJob((req.body as CreateJobDto['body']));
    return ResponseHelper.created(res, data, JOBS_CONSTANTS.MESSAGES.JOB_CREATED_SUCCESSFULLY, req.path);
  };

  createBulkJobs = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.jobsService.createBulkJobs((req.body as CreateBulkJobsDto['body']).jobs);
    return ResponseHelper.created(res, data, JOBS_CONSTANTS.MESSAGES.JOBS_CREATED_SUCCESSFULLY, req.path);
  };

  unsaveJob = async (req: Request, res: Response): Promise<Response> => {
    await this.jobsService.unsaveJob(req.user!.id, (req.params as JobIdParamDto['params']).id);
    return ResponseHelper.ok(
      res,
      {},
      JOBS_CONSTANTS.MESSAGES.JOB_REMOVED_FROM_SAVED_LIST,
      req.path
    );
  };
}
