import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { SETTINGS_MESSAGES } from './settings.constants';
import ResponseHelper from '@/shared/utils/api-response';

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  getSettings = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.settingsService.getSettings();
    return ResponseHelper.ok(res, data, SETTINGS_MESSAGES.SETTINGS_RETRIEVED, _req.path);
  };

  saveSettings = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.settingsService.saveSettings(req.body);
    return ResponseHelper.ok(res, data, SETTINGS_MESSAGES.SETTINGS_SAVED, req.path);
  };

  getLogo = async (_req: Request, res: Response): Promise<Response> => {
    const data = await this.settingsService.getLogo();
    return ResponseHelper.ok(res, data, SETTINGS_MESSAGES.LOGO_RETRIEVED, _req.path);
  };

  uploadLogo = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.settingsService.uploadLogo(req.file);
    return ResponseHelper.created(res, data, SETTINGS_MESSAGES.LOGO_UPLOADED, req.path);
  };
}
