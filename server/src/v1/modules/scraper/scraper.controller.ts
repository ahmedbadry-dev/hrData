// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/v1/modules/scraper/scraper.controller.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Request, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { ScraperService } from './scraper.service';
import { SCRAPER_CONSTANTS } from './scraper.constants';

export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // GET /api/v1/admin/scraper/status
  getStatus = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.scraperService.getStatus();
    return ResponseHelper.ok(res, data, SCRAPER_CONSTANTS.MESSAGES.STATUS_FETCHED, req.path);
  };

  // POST /api/v1/admin/scraper/start
  start = async (req: Request, res: Response): Promise<Response> => {
    await this.scraperService.start();
    return ResponseHelper.ok(res, {}, SCRAPER_CONSTANTS.MESSAGES.STARTED, req.path);
  };

  // POST /api/v1/admin/scraper/stop
  stop = async (req: Request, res: Response): Promise<Response> => {
    await this.scraperService.stop();
    return ResponseHelper.ok(res, {}, SCRAPER_CONSTANTS.MESSAGES.STOPPED, req.path);
  };

  // POST /api/v1/admin/scraper/run-now
  runNow = async (req: Request, res: Response): Promise<Response> => {
    await this.scraperService.runNow();
    return ResponseHelper.ok(res, {}, SCRAPER_CONSTANTS.MESSAGES.MANUAL_RUN_QUEUED, req.path);
  };

  // GET /api/v1/admin/scraper/logs
  getScrapedLogs = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.scraperService.getScrapedLogs();
    return ResponseHelper.ok(res, data, 'Scraper logs fetched successfully', req.path);
  };
}
