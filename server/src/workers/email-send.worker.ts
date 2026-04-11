import { Worker, Job } from 'bullmq';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { randomUUID } from 'crypto';

import { emailSendQueue } from '@/config/bullmq';
import redis from '@/config/redis';
import { emailConfig } from '@/config/env.config';
import { transporterSingleton } from '@/config/mailer.config';
import prismaClient from '@/config/db.config';
import { jobApplicationTemplate } from '@/notifications/templates/job-application.template';
import { generateTrackingPixelUrl } from '@/shared/utils/tracking-pixel.util';
import logger from '@/shared/utils/logger.util';
import { ApplicationStatus } from 'generated/prisma';

export interface EmailSendJobData {
  applicationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  hrEmail: string;
  jobTitle: string;
  companyName: string;
  cvUrl: string | null;
}

export const emailSendWorker = new Worker<EmailSendJobData>(
  emailSendQueue.name,
  async (job: Job<EmailSendJobData>) => {
    const { applicationId, userName, userEmail, hrEmail, jobTitle, companyName, cvUrl } = job.data;

    logger.info(`📧 Processing email job ${job.id} for application ${applicationId}`);

    try {
      await prismaClient.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.SENDING },
      });

      const token = randomUUID();
      const trackingPixelUrl = generateTrackingPixelUrl(token);

      const html = jobApplicationTemplate({
        recipientName: userName,
        jobTitle,
        companyName,
        trackingPixelUrl,
      });

      const mailOptions: nodemailer.SendMailOptions = {
        from: userEmail,
        to: hrEmail,
        subject: `طلب انضمام — ${jobTitle}`,
        html,
        attachments: cvUrl
          ? [
              {
                filename: 'CV.pdf',
                path: cvUrl,
              },
            ]
          : [],
      };

      const info = await transporterSingleton.sendMail(mailOptions);
      logger.info(`✅ Email sent to ${hrEmail} — messageId: ${info.messageId}`);

      const hasSmtpCredentials = emailConfig.user && emailConfig.password;
      if (!hasSmtpCredentials) {
        logger.info(`🔍 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

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
      logger.error(`❌ Failed to send email for application ${applicationId}`, { error });

      const retryCount = job.attemptsMade || 0;

      await prismaClient.application.update({
        where: { id: applicationId },
        data: {
          status: retryCount >= 3 ? ApplicationStatus.FAILED : ApplicationStatus.SCHEDULED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
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

emailSendWorker.on('completed', (job) => {
  logger.info(`🎉 Job ${job.id} completed successfully`);
});

emailSendWorker.on('failed', (job, error) => {
  logger.error(`💥 Job ${job?.id} failed`, { error: error.message });
});

emailSendWorker.on('error', (error) => {
  logger.error(`💥 Worker error`, { error: error.message });
});

logger.info('✅ Email send worker started');
