import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AUTH_CONSTANTS } from './auth.constants';
import ResponseHelper from '@/shared/utils/api-response';
import { UAParser } from 'ua-parser-js';
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
    const data = await this.authService.login(req.body, this.getDeviceInfo(req));
    if ('requestTwoFactor' in data) {
      return ResponseHelper.ok(res, data, 'Two factor authentication required', req.path);
    }
    this.setRefreshTokenCookie(res, data.tokens.refreshToken);
    return ResponseHelper.ok(
      res,
      {
        user: data.user,
        tokens: { accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken },
      },
      'User logged in successfully',
      req.path
    );
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    await this.authService.logout(req.user!.id, req.cookies.refreshToken);
    res.clearCookie('refreshToken');
    return ResponseHelper.ok(res, {}, 'User logged out successfully', req.path);
  };

  logoutAll = async (req: Request, res: Response): Promise<Response> => {
    await this.authService.logoutAll(req.user!.id);
    res.clearCookie('refreshToken');
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
    const { user } = await this.authService.forgotPassword(req.body);

    return ResponseHelper.ok(res, { user }, 'Password reset token sent successfully', req.path);
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.authService.resetPassword(req.body, {
      token: req.query.token as string,
    });
    this.clearRefreshTokenCookie(res);
    return ResponseHelper.ok(res, data, 'Password reset successfully', req.path);
  };

  changePassword = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.authService.changePassword(req.user!.id, req.body);
    this.clearRefreshTokenCookie(res);
    return ResponseHelper.ok(res, data, 'Password changed successfully', req.path);
  };

  // Helper methods

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

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME);
  }
}
