import { Worker, Job } from 'bullmq';
import { randomUUID } from 'crypto';
import { Buffer } from 'buffer';
import path from 'path';
import { access, readFile } from 'fs/promises';

import { jobApplicationsScheduleQueue } from '@/config/bullmq';
import redis from '@/config/redis';
import prismaClient from '@/config/db.config';
import { jobApplicationTemplate } from '@/notifications/templates/job-application.template';
import { generateTrackingPixelUrl } from '@/shared/utils/tracking-pixel.util';
import logger from '@/shared/utils/logger.util';
import { ApplicationStatus } from '@prisma/client';
import { GmailSender } from '@/v1/modules/gmail/gmail-sender.util';

export interface JobApplicationsScheduleJobData {
  applicationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  hrEmail: string;
  jobTitle: string;
  companyName: string;
  cvData: string | null;
  cvFileName: string | null;
}

export const jobApplicationsScheduleWorker = new Worker<JobApplicationsScheduleJobData>(
  jobApplicationsScheduleQueue.name,
  async (job: Job<JobApplicationsScheduleJobData>) => {
    const {
      applicationId,
      userId,
      userName,
      userEmail,
      hrEmail,
      jobTitle,
      companyName,
      cvData,
      cvFileName,
    } = job.data;

    const attachments: Array<{ filename: string; content: Buffer }> =
      cvData && cvFileName
        ? [{ filename: cvFileName, content: Buffer.from(cvData, 'base64') }]
        : [];

    logger.info(`📧 Processing email job ${job.id} for application ${applicationId}`);

    try {
      let statusChanged = false;
      try {
        const updated = await prismaClient.application.update({
          where: {
            id: applicationId,
            status: ApplicationStatus.SCHEDULED,
          },
          data: { status: ApplicationStatus.SENDING },
        });
        statusChanged = !!updated;
      } catch (updateError: unknown) {
        const err = updateError as { code?: string; message?: string; meta?: { cause?: string } };
        const isNotFound =
          err?.code === 'P2025' ||
          err?.code === 'P2015' ||
          (err?.message?.includes('no record found') ?? false) ||
          (err?.message?.includes('Record to update') ?? false);

        if (isNotFound) {
          logger.info(`⏭️ Application ${applicationId} not SCHEDULED — skipping`);
          return;
        }
        throw updateError;
      }

      const app = await prismaClient.application.findUnique({
        where: { id: applicationId },
        select: { status: true },
      });

      if (app?.status === ApplicationStatus.CANCELLED) {
        logger.info(`⏭️ Application ${applicationId} was cancelled — skipping`);
        return;
      }

      const token = randomUUID();
      const trackingPixelUrl = generateTrackingPixelUrl(token);

      const logoSetting = await prismaClient.systemSetting.findUnique({
        where: { key: 'app_logo' },
      });
      let logoCid: string | null = null;
      let logoMimeType: string | null = null;
      let logoBuffer: Buffer | null = null;
      if (logoSetting?.value) {
        const fullPath = path.join(process.cwd(), logoSetting.value.replace(/^\//, ''));
        try {
          await access(fullPath);
          logoBuffer = await readFile(fullPath);
          logoCid = 'companylogo';
          const ALLOWED_IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);
          const ext = path.extname(logoSetting.value).replace('.', '').toLowerCase();
          if (ALLOWED_IMAGE_EXTS.has(ext)) {
            logoMimeType = `image/${ext}`;
          } else {
            logoCid = null;
          }
        } catch {
          logoBuffer = null;
        }
      }

      const html = jobApplicationTemplate({
        recipientName: userName,
        jobTitle,
        companyName,
        trackingPixelUrl,
        logoCid,
        logoMimeType,
      });

      const gmailSender = new GmailSender(prismaClient);
      const { messageId } = await gmailSender.sendEmail(userId, {
        to: hrEmail,
        subject: `طلب انضمام — ${jobTitle}`,
        htmlBody: html,
        replyTo: userEmail,
        attachments: attachments.length > 0 ? attachments : undefined,
        logoBuffer,
        logoMimeType,
      });

      logger.info(`✅ Email sent to ${hrEmail} — messageId: ${messageId}`);

      await prismaClient.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.EMAIL_SENT,
          sentAt: new Date(),
          trackingToken: token,
        },
      });

      logger.info(`✅ Application ${applicationId} marked as EMAIL_SENT`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`❌ Failed to send email for application ${applicationId}: ${errorMessage}`);

      const isScopeError = errorMessage.includes('insufficient authentication scopes');
      if (isScopeError) {
        logger.error(
          `⚠️ Gmail scope error - user ${userId} needs to reconnect their Gmail account`
        );
      }

      const retryCount = job.attemptsMade || 0;

      await prismaClient.application.update({
        where: { id: applicationId },
        data: {
          status: retryCount >= 2 ? ApplicationStatus.EMAIL_FAILED : ApplicationStatus.SCHEDULED,
          errorMessage: isScopeError
            ? 'Gmail not connected or insufficient permissions. Please reconnect from Settings.'
            : errorMessage,
          retryCount,
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

jobApplicationsScheduleWorker.on('completed', (job) => {
  logger.info(`🎉 Job ${job.id} completed successfully`);
});

jobApplicationsScheduleWorker.on('failed', (job, error) => {
  logger.error(`💥 Job ${job?.id} failed`, { error: error.message });
});

jobApplicationsScheduleWorker.on('error', (error) => {
  logger.error(`💥 Worker error`, { error: error.message });
});

logger.info('✅ Job applications schedule worker started');
