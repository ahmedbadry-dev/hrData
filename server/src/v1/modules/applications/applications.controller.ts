import { Request, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { ApplicationsService } from './applications.service';
import { APPLICATIONS_CONSTANTS } from './applications.constants';
import { ScheduleApplicationsDto } from './dto/schedule-applications.dto';
import { GetApplicationsDto } from './dto/get-applications.dto';
import { ApplicationIdParamDto } from './dto/application-id-param.dto';

export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  getApplications = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.applicationsService.getApplications(
      req.user!.id,
      req.query as GetApplicationsDto['query']
    );
    return ResponseHelper.ok(
      res,
      data,
      APPLICATIONS_CONSTANTS.MESSAGES.APPLICATIONS_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  getApplicationById = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.applicationsService.getApplicationById(
      req.user!.id,
      (req.params as ApplicationIdParamDto['params']).id
    );
    return ResponseHelper.ok(
      res,
      data,
      APPLICATIONS_CONSTANTS.MESSAGES.APPLICATION_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  scheduleApplications = async (req: Request, res: Response): Promise<Response> => {
    const { jobIds, sendTime, delayBetweenEmails } = req.body as ScheduleApplicationsDto['body'];
    const data = await this.applicationsService.scheduleApplications(
      req.user!.id,
      jobIds,
      sendTime,
      delayBetweenEmails
    );
    return ResponseHelper.created(
      res,
      data,
      APPLICATIONS_CONSTANTS.MESSAGES.APPLICATION_SCHEDULED_SUCCESSFULLY,
      req.path
    );
  };

  cancelApplication = async (req: Request, res: Response): Promise<Response> => {
    await this.applicationsService.cancelApplication(
      req.user!.id,
      (req.params as ApplicationIdParamDto['params']).id
    );
    return ResponseHelper.ok(
      res,
      {},
      APPLICATIONS_CONSTANTS.MESSAGES.APPLICATION_CANCELLED_SUCCESSFULLY,
      req.path
    );
  };
}
