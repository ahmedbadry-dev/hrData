import { Request, Response } from 'express';

import logger from '@/shared/utils/logger.util';
import { TRANSPARENT_GIF } from '@/shared/utils/tracking-pixel.util';
import { TrackingService } from './tracking.service';

export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  handlePixel = async (req: Request, res: Response): Promise<Response> => {
    const { token } = req.params as { token: string };

    try {
      await this.trackingService.recordEmailOpen(token);
    } catch (error) {
      logger.error(`❌ Failed to process tracking pixel for token ${token}`, { error });
    }

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');

    return res.status(200).send(TRANSPARENT_GIF);
  };
}
