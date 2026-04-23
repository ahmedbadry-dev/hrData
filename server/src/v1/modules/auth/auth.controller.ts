import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { AuthService } from './auth.service';
import { AUTH_CONSTANTS } from './auth.constants';
import ResponseHelper from '@/shared/utils/api-response';
import { UAParser } from 'ua-parser-js';
import { appConfig } from '@/config/env.config';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<Response> => {
    const { user } = await this.authService.register(req.body);
    return ResponseHelper.created(res, { user }, 'User registered successfully', req.path);
  };

  verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.authService.verifyEmail({
      token: req.query.token as string,
    });
    return ResponseHelper.ok(res, user, 'User verified successfully', req.path);
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    console.log('[Auth] Login request received for:', req.body.email);
    const data = await this.authService.login(req.body, this.getDeviceInfo(req));
    if ('requestTwoFactor' in data) {
      return ResponseHelper.ok(res, data, 'Two factor authentication required', req.path);
    }
    const rememberMe = Boolean(req.body.rememberMe);
    console.log('[Auth] Setting refresh token cookie. RememberMe:', rememberMe);
    this.setRefreshTokenCookie(res, data.tokens.refreshToken, rememberMe);
    console.log('[Auth] Cookie set successfully. Sending response.');
    return ResponseHelper.ok(
      res,
      {
        user: data.user,
        tokens: { accessToken: data.tokens.accessToken },
      },
      'User logged in successfully',
      req.path
    );
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    await this.authService.logout(req.user!.id, req.cookies.refreshToken);
    this.clearRefreshTokenCookie(res);
    return ResponseHelper.ok(res, {}, 'User logged out successfully', req.path);
  };

  logoutAll = async (req: Request, res: Response): Promise<Response> => {
    await this.authService.logoutAll(req.user!.id);
    this.clearRefreshTokenCookie(res);
    return ResponseHelper.ok(res, {}, 'User logged out from all devices successfully', req.path);
  };

  refresh = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.authService.refresh(req.cookies.refreshToken, this.getDeviceInfo(req));
    this.setRefreshTokenCookie(res, data.tokens.refreshToken);
    return ResponseHelper.ok(
      res,
      {
        user: data.user,
        tokens: { accessToken: data.tokens.accessToken },
      },
      'Tokens refreshed successfully',
      req.path
    );
  };

  forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.authService.forgotPassword(req.body);

    return ResponseHelper.ok(res, data, 'Password reset token sent successfully', req.path);
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.authService.resetPassword(req.body, {
      token: req.query.token as string,
    });
    this.clearRefreshTokenCookie(res);
    return ResponseHelper.ok(res, data, 'Password reset successfully', req.path);
  };

  validateResetToken = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.authService.validateResetToken(req.query.token as string);
    return ResponseHelper.ok(res, data, 'Token is valid', req.path);
  };

  changePassword = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.authService.changePassword(req.user!.id, req.body);
    this.clearRefreshTokenCookie(res);
    return ResponseHelper.ok(res, data, 'Password changed successfully', req.path);
  };

  private getDeviceInfo(req: Request) {
    const userAgent = req.get('User-Agent') || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const deviceName = `${result.browser.name || 'Unknown Browser'} on ${result.os.name || 'Unknown OS'}`;

    return {
      ipAddress: req.ip!,
      userAgent,
      deviceName,
    };
  }

  private setRefreshTokenCookie(res: Response, token: string, rememberMe = true) {
    const csrfToken = crypto.randomBytes(32).toString('hex');

    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none';
      maxAge?: number;
    } = {
      httpOnly: true,
      secure: appConfig.isProduction,
      sameSite: appConfig.isProduction ? 'none' : 'lax',
    };

    if (rememberMe) {
      cookieOptions.maxAge = AUTH_CONSTANTS.REMEMBER_ME_MAX_AGE;
    }

    console.log('[Auth] Cookie Options:', JSON.stringify(cookieOptions));
    res.cookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, token, cookieOptions);

    res.cookie(AUTH_CONSTANTS.SESSION_HINT_COOKIE_NAME, '1', {
      httpOnly: false,
      secure: appConfig.isProduction,
      sameSite: appConfig.isProduction ? 'none' : 'lax',
      path: '/',
      ...(rememberMe ? { maxAge: AUTH_CONSTANTS.REMEMBER_ME_MAX_AGE } : {}),
    });

    res.cookie(AUTH_CONSTANTS.CSRF_TOKEN_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      secure: appConfig.isProduction,
      sameSite: appConfig.isProduction ? 'none' : 'lax',
      path: '/',
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME);
    res.clearCookie(AUTH_CONSTANTS.SESSION_HINT_COOKIE_NAME);
    res.clearCookie(AUTH_CONSTANTS.CSRF_TOKEN_COOKIE_NAME);
  }
}
