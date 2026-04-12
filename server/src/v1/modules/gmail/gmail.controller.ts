import { Request, Response } from 'express';

import { GmailService } from './gmail.service';
import ResponseHelper from '@/shared/utils/api-response';
import { appConfig } from '@/config/env.config';

const APP_BASE_URL = appConfig.appUrl.replace(/\/+$/, '');

export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  getAuthUrl = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.gmailService.createAuthUrl(req.user!.id);
    return ResponseHelper.ok(res, data, 'Gmail OAuth URL generated', req.path);
  };

  handleCallback = async (req: Request, res: Response): Promise<void> => {
    const { code, state } = req.query as { code: string; state: string };
    await this.gmailService.connectWithAuthorizationCode(code, state);
    const redirectTo = `${APP_BASE_URL}/dashboard/settings?gmailConnected=true`;
    res.redirect(302, redirectTo);
  };

  disconnect = async (req: Request, res: Response): Promise<Response> => {
    await this.gmailService.disconnect(req.user!.id);
    return ResponseHelper.ok(
      res,
      { connected: false },
      'Gmail disconnected successfully',
      req.path
    );
  };

  getStatus = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.gmailService.getConnectionStatus(req.user!.id);
    return ResponseHelper.ok(res, data, 'Gmail connection status fetched', req.path);
  };
}
