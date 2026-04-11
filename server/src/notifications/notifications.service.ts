import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { randomUUID } from 'crypto';
import { ApplicationStatus, Prisma, PrismaClient } from 'generated/prisma';

import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { applicationStatusTemplate } from './templates/application-status.template';
import { appConfig, emailConfig } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';
import { transporterSingleton } from '@/config/mailer.config';
import prismaClient from '@/config/db.config';
import { generateTrackingPixelUrl } from '@/shared/utils/tracking-pixel.util';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { InternalServerError } from '@/shared/errors/InternalServerError';

export class NotificationsService {
  constructor(
    private readonly transporter: Transporter<SMTPTransport.SentMessageInfo> = transporterSingleton,
    private readonly fromAddress: string = emailConfig.from,
    private readonly prisma: PrismaClient = prismaClient
  ) {}
  private async sendEmail(options: { to: string; subject: string; html: string }) {
    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const info = await this.transporter.sendMail({
          from: this.fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
        });

        logger.info(`📧 Email sent to ${options.to} — messageId: ${info.messageId}`);
        const hasSmtpCredentials = emailConfig.user && emailConfig.password;
        if (!hasSmtpCredentials) {
          logger.info(`🔍 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return;
      } catch (error) {
        attempts++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
          `❌ Attempt ${attempts} failed to send email to ${options.to}: ${errorMessage}`
        );

        if (attempts >= MAX_RETRIES) {
          logger.error(
            `🚨 All ${MAX_RETRIES} attempts failed to send email to ${options.to}. Giving up.`
          );
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, attempts * 1000));
      }
    }
  }

  async sendVerificationEmail(name: string, email: string, token: string): Promise<void> {
    const url = `${appConfig.appUrl}/verify-email?token=${token}`;
    await this.sendEmail({
      to: email,
      subject: 'تحقق من بريدك الإلكتروني - كفو',
      html: verifyEmailTemplate(name, url),
    });
  }

  async sendPasswordResetEmail(name: string, email: string, token: string): Promise<void> {
    const url = `${appConfig.appUrl}/api/v1/auth/reset-password?token=${token}`;
    await this.sendEmail({
      to: email,
      subject: 'Reset your password',
      html: resetPasswordTemplate(name, url),
    });
  }

  async sendApplicationStatusEmail(
    applicationId: string,
    recipientEmail: string,
    recipientName: string,
    message: string
  ): Promise<void> {
    const token = randomUUID();
    const trackingPixelUrl = generateTrackingPixelUrl(token);

    try {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          trackingToken: token,
          status: ApplicationStatus.EMAIL_SENT,
          sentAt: new Date(),
        },
      });

      await this.sendEmail({
        to: recipientEmail,
        subject: 'Application Status Update',
        html: applicationStatusTemplate({
          recipientName,
          message,
          trackingPixelUrl,
        }),
      });

      logger.info(
        `✅ Application status email processed for application ${applicationId} and recipient ${recipientEmail}`
      );
    } catch (error) {
      logger.error(
        `❌ Failed to send application status email for application ${applicationId} and recipient ${recipientEmail}`,
        { error }
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Application with id ${applicationId} not found`);
      }

      if (error instanceof Error) {
        throw new InternalServerError(error.message);
      }

      throw new InternalServerError('Failed to send application status email');
    }
  }
}

export const notificationsService = new NotificationsService();
