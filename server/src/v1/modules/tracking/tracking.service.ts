import { ApplicationStatus, PrismaClient } from '@prisma/client';

import logger from '@/shared/utils/logger.util';
import { InternalServerError } from '@/shared/errors/InternalServerError';

export class TrackingService {
  constructor(private readonly prisma: PrismaClient) {}

  async recordEmailOpen(token: string): Promise<void> {
    try {
      const application = await this.prisma.application.findUnique({
        where: { trackingToken: token },
        select: {
          id: true,
          status: true,
        },
      });

      if (!application) {
        logger.warn(`⚠️ No application found for tracking token ${token}`);
        return;
      }

      if (application.status === ApplicationStatus.EMAIL_OPENED) {
        logger.info(`📌 Email open already recorded for application ${application.id}`);
        return;
      }

      await this.prisma.application.update({
        where: { id: application.id },
        data: {
          status: ApplicationStatus.EMAIL_OPENED,
          openedAt: new Date(),
        },
      });

      logger.info(`📬 Email open recorded for application ${application.id}`);
    } catch (error) {
      logger.error(`❌ Failed to record email open for token ${token}`, { error });

      if (error instanceof Error) {
        throw new InternalServerError(error.message);
      }

      throw new InternalServerError('Failed to record email open');
    }
  }
}
