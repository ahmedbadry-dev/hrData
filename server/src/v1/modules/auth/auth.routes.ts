import { Router } from 'express';
import { AuthController } from './auth.controller';
import {
  validateAllMiddleware,
  validateBodyMiddleware,
  validateQueryMiddleware,
} from '../../../http/middlewares/validation.middleware';
import { CreateUserDtoSchema } from './dto/create-user.dto';
import { VerifyEmailDtoSchema } from './dto/verify-email.dto';
import { LoginDtoSchema } from './dto/login.dto';
import { authenticationMiddleware } from '../../../http/middlewares/auth.middleware';
import { ForgotPasswordDtoSchema } from './dto/forgot-password.dto';
import { ResetPasswordDtoSchema } from './dto/reset-password.dto';
import { ChangePasswordDtoSchema } from './dto/change-password.dto';

export const authRoutes = (authController: AuthController) => {
  const router = Router();

  router.post('/register', validateBodyMiddleware(CreateUserDtoSchema), authController.register);
  router.post(
    '/verify-email',
    validateQueryMiddleware(VerifyEmailDtoSchema),
    authController.verifyEmail
  );
  router.post('/login', validateBodyMiddleware(LoginDtoSchema), authController.login);
  router.post('/logout', authenticationMiddleware, authController.logout);
  router.post('/logout-all', authenticationMiddleware, authController.logoutAll);
  router.post('/refresh', authController.refresh);
  router.post(
    '/forgot-password',
    validateBodyMiddleware(ForgotPasswordDtoSchema),
    authController.forgotPassword
  );
  router.post(
    '/reset-password',
    validateAllMiddleware(ResetPasswordDtoSchema),
    authController.resetPassword
  );
  router.patch(
    '/change-password',
    authenticationMiddleware,
    validateBodyMiddleware(ChangePasswordDtoSchema),
    authController.changePassword
  );
  return router;
};
