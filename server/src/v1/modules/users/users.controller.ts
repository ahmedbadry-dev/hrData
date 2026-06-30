import { Request, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { GetUsersDto } from './dto/get-users.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetUserQuotaDto } from './dto/reset-user-quota.dto';
import { UsersService } from './users.service';
import { USERS_CONSTANTS } from './users.constants';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getUsers = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.usersService.getUsers(req.query as GetUsersDto['query']);
    return ResponseHelper.ok(
      res,
      data,
      USERS_CONSTANTS.MESSAGES.USERS_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.usersService.getUserById((req.params as UserIdParamDto['params']).id);
    return ResponseHelper.ok(
      res,
      data,
      USERS_CONSTANTS.MESSAGES.USER_FETCHED_SUCCESSFULLY,
      req.path
    );
  };

  updateUser = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.usersService.updateUser(
      (req.params as UserIdParamDto['params']).id,
      req.body as UpdateUserDto['body']
    );
    return ResponseHelper.ok(
      res,
      data,
      USERS_CONSTANTS.MESSAGES.USER_UPDATED_SUCCESSFULLY,
      req.path
    );
  };

  suspendUser = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.usersService.suspendUser((req.params as UserIdParamDto['params']).id);
    return ResponseHelper.ok(
      res,
      data,
      USERS_CONSTANTS.MESSAGES.USER_SUSPENDED_SUCCESSFULLY,
      req.path
    );
  };

  activateUser = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.usersService.activateUser((req.params as UserIdParamDto['params']).id);
    return ResponseHelper.ok(
      res,
      data,
      USERS_CONSTANTS.MESSAGES.USER_ACTIVATED_SUCCESSFULLY,
      req.path
    );
  };

  restoreUserQuota = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.usersService.restoreUserQuota(
      (req.params as UserIdParamDto['params']).id,
      req.user!.id,
      req.body as ResetUserQuotaDto['body']
    );

    return ResponseHelper.ok(
      res,
      data,
      USERS_CONSTANTS.MESSAGES.USER_QUOTA_RESET_SUCCESSFULLY,
      req.path
    );
  };

  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    await this.usersService.deleteUser((req.params as UserIdParamDto['params']).id);
    return ResponseHelper.ok(res, {}, USERS_CONSTANTS.MESSAGES.USER_DELETED_SUCCESSFULLY, req.path);
  };
}
