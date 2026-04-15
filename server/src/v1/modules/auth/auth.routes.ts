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
import { ValidateResetTokenDtoSchema } from './dto/validate-reset-token.dto';
import { authRateLimitMiddleware } from '@/http/middlewares/rate-limit.middleware';

export const authRoutes = (authController: AuthController) => {
  const router = Router();

  router.post(
    '/register',
    authRateLimitMiddleware,
    validateBodyMiddleware(CreateUserDtoSchema),
    authController.register
  );
  router.post(
    '/verify-email',
    authRateLimitMiddleware,
    validateQueryMiddleware(VerifyEmailDtoSchema),
    authController.verifyEmail
  );
  router.post(
    '/login',
    authRateLimitMiddleware,
    validateBodyMiddleware(LoginDtoSchema),
    authController.login
  );
  router.post('/logout', authRateLimitMiddleware, authenticationMiddleware, authController.logout);
  router.post(
    '/logout-all',
    authRateLimitMiddleware,
    authenticationMiddleware,
    authController.logoutAll
  );
  router.post('/refresh', authRateLimitMiddleware, authController.refresh);
  router.post(
    '/forgot-password',
    authRateLimitMiddleware,
    validateBodyMiddleware(ForgotPasswordDtoSchema),
    authController.forgotPassword
  );
  router.post(
    '/reset-password',
    authRateLimitMiddleware,
    validateAllMiddleware(ResetPasswordDtoSchema),
    authController.resetPassword
  );
  router.get(
    '/validate-reset-token',
    authRateLimitMiddleware,
    validateQueryMiddleware(ValidateResetTokenDtoSchema),
    authController.validateResetToken
  );
  router.patch(
    '/change-password',
    authRateLimitMiddleware,
    authenticationMiddleware,
    validateBodyMiddleware(ChangePasswordDtoSchema),
    authController.changePassword
  );
  return router;
};
