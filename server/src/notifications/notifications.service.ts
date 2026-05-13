import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import pLimit from 'p-limit';

import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { announcementTemplate } from './templates/announcement.template';
import { notificationEmailTemplate } from './templates/notification-email.template';
import { appConfig, emailConfig } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';
import { transporterSingleton } from '@/config/mailer.config';

export class NotificationsService {
  private logoCid: string | null = null;
  private logoMimeType: string | null = null;
  private logoBuffer: Buffer | null = null;

  constructor(
    private readonly transporter: Transporter<SMTPTransport.SentMessageInfo> = transporterSingleton,
    private readonly fromAddress: string = emailConfig.from
  ) {}

  setLogo(logoCid: string | null, logoMimeType: string | null, logoBuffer: Buffer | null): void {
    this.logoCid = logoCid;
    this.logoMimeType = logoMimeType;
    this.logoBuffer = logoBuffer;
  }

  getLogoCid(): { logoCid: string | null; logoMimeType: string | null } {
    return { logoCid: this.logoCid, logoMimeType: this.logoMimeType };
  }

  async refreshLogoUrl(): Promise<void> {
    const { SettingsService } = await import('../v1/modules/settings/settings.service');
    const { default: prisma } = await import('../config/db.config');
    const settingsService = new SettingsService(prisma);
    const logoResult = await settingsService.getLogo();
    this.logoCid = logoResult.logoCid || null;
    this.logoMimeType = logoResult.logoMimeType || null;
    this.logoBuffer = logoResult.logoBuffer ? Buffer.from(logoResult.logoBuffer, 'base64') : null;
  }

  private async sendEmail(options: { to: string; subject: string; html: string }) {
    const MAX_RETRIES = 3;
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        if (!this.logoCid || !this.logoBuffer) {
          await this.refreshLogoUrl().catch(() => {});
        }

        const mailOptions: any = {
          from: this.fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
        };

        if (this.logoBuffer && this.logoCid) {
          mailOptions.attachments = [
            {
              filename: 'logo.png',
              content: this.logoBuffer,
              cid: this.logoCid,
            },
          ];
        }

        const info = await this.transporter.sendMail(mailOptions);

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
      subject: 'تحقق من بريدك الإلكتروني',
      html: verifyEmailTemplate(name, url, this.logoCid, this.logoMimeType),
    });
  }

  async sendPasswordResetEmail(name: string, email: string, token: string): Promise<void> {
    const url = `${appConfig.appUrl}/reset-password?token=${token}`;
    await this.sendEmail({
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: resetPasswordTemplate(name, url, this.logoCid, this.logoMimeType),
    });
  }

  async sendAnnouncementEmail(
    recipientName: string,
    recipientEmail: string,
    title: string,
    message: string
  ): Promise<void> {
    await this.sendEmail({
      to: recipientEmail,
      subject: `إعلان جديد - ${title}`,
      html: announcementTemplate(recipientName, title, message, this.logoCid, this.logoMimeType),
    });
  }

  async sendNotificationEmail(data: {
    to: string;
    fullName: string | null;
    title: string;
    body: string;
  }): Promise<void> {
    await this.sendEmail({
      to: data.to,
      subject: data.title,
      html: notificationEmailTemplate(
        data.fullName || data.to,
        data.title,
        data.body,
        this.logoCid,
        this.logoMimeType
      ),
    });
  }
}

export const notificationsService = new NotificationsService();
