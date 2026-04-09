import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '@/http/middlewares/auth.middleware';
import ResponseHelper from '@/shared/utils/api-response';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RevokeSessionDto } from './dto/revoke-session.dto';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response): Promise<Response> {
    const dto: CreateUserDto = req.body;
    const result = await this.authService.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName
    );
    return ResponseHelper.created(res, result, 'Registration successful', req.path);
  }

  async verifyEmail(req: Request, res: Response): Promise<Response> {
    const { token } = req.query as VerifyEmailDto;
    const result = await this.authService.verifyEmail(token);
    return ResponseHelper.ok(res, result, 'Email verified', req.path);
  }

  async login(req: Request, res: Response): Promise<Response> {
    const dto: LoginDto = req.body;
    const result = await this.authService.login(dto.email, dto.password);
    return ResponseHelper.ok(res, result, 'Login successful', req.path);
  }

  async logout(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const result = await this.authService.logout(userId);
    return ResponseHelper.ok(res, result, 'Logged out', req.path);
  }

  async logoutAll(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const result = await this.authService.logoutAll(userId);
    return ResponseHelper.ok(res, result, 'Logged out from all sessions', req.path);
  }

  async refresh(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.body as { refreshToken: string };
    const result = await this.authService.refresh(refreshToken);
    return ResponseHelper.ok(res, result, 'Token refreshed', req.path);
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    const dto: ForgotPasswordDto = req.body;
    const result = await this.authService.forgotPassword(dto.email);
    return ResponseHelper.ok(res, result, 'Password reset email sent', req.path);
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const token = (req.query as { token: string }).token;
    const { password } = req.body as { password: string };
    const result = await this.authService.resetPassword(token, password);
    return ResponseHelper.ok(res, result, 'Password reset successful', req.path);
  }

  async changePassword(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const dto: ChangePasswordDto = req.body;
    const result = await this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword
    );
    return ResponseHelper.ok(res, result, 'Password changed successfully', req.path);
  }

  async revokeSession(req: AuthRequest, res: Response): Promise<Response> {
    const userId = req.user!.userId;
    const { sessionId } = req.params as RevokeSessionDto;
    const result = await this.authService.revokeSession(userId, sessionId);
    return ResponseHelper.ok(res, result, 'Session revoked', req.path);
  }
}
