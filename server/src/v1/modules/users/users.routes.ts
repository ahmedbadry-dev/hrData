import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../../http/middlewares/auth.middleware';
import {
  validateParamsMiddleware,
  validateQueryMiddleware,
  validateBodyMiddleware,
} from '../../../http/middlewares/validation.middleware';
import { GetUsersDtoSchema } from './dto/get-users.dto';
import { UserIdParamDtoSchema } from './dto/user-id-param.dto';
import { UpdateUserDtoSchema } from './dto/update-user.dto';
import { ResetUserQuotaDtoSchema } from './dto/reset-user-quota.dto';
import { UsersController } from './users.controller';

export const usersRoutes = (usersController: UsersController): Router => {
  const router = Router();

  router.get(
    '/',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateQueryMiddleware(GetUsersDtoSchema),
    usersController.getUsers
  );

  router.get(
    '/:id',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateParamsMiddleware(UserIdParamDtoSchema),
    usersController.getUserById
  );

  router.patch(
    '/:id',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateParamsMiddleware(UserIdParamDtoSchema),
    validateBodyMiddleware(UpdateUserDtoSchema),
    usersController.updateUser
  );

  router.patch(
    '/:id/suspend',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateParamsMiddleware(UserIdParamDtoSchema),
    usersController.suspendUser
  );

  router.patch(
    '/:id/activate',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateParamsMiddleware(UserIdParamDtoSchema),
    usersController.activateUser
  );

  router.post(
    '/:id/quota-reset',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateParamsMiddleware(UserIdParamDtoSchema),
    validateBodyMiddleware(ResetUserQuotaDtoSchema),
    usersController.restoreUserQuota
  );

  router.delete(
    '/:id',
    authenticationMiddleware,
    authorizationMiddleware(UserRole.ADMIN),
    validateParamsMiddleware(UserIdParamDtoSchema),
    usersController.deleteUser
  );

  return router;
};
