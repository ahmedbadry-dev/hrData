import { Resend } from 'resend';
import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { announcementTemplate } from './templates/announcement.template';
import { notificationEmailTemplate } from './templates/notification-email.template';
import { appConfig, resendConfig } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';

export class NotificationsService {
  private readonly resend: Resend;
  private readonly fromAddress: string;

  constructor(
    resendApiKey: string = resendConfig.resendApiKey,
    fromAddress: string = resendConfig.from
  ) {
    this.resend = new Resend(resendApiKey);
    this.fromAddress = fromAddress;
  }

  private async sendEmail(options: { to: string; subject: string; html: string }) {
    const MAX_RETRIES = 3;
    let attempts = 0;

    logger.info(`📧 Attempting to send email from: ${this.fromAddress}`);

    while (attempts < MAX_RETRIES) {
      try {
        const { data, error } = await this.resend.emails.send({
          from: this.fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
        });

        if (error) throw new Error(error.message);

        logger.info(`📧 Email sent to ${options.to} — id: ${data?.id}`);
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
    const url = `${appConfig.appUrl}/reset-password?token=${token}`;
    await this.sendEmail({
      to: email,
      subject: 'إعادة تعيين كلمة المرور - كفو',
      html: resetPasswordTemplate(name, url),
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
      html: announcementTemplate(recipientName, title, message),
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
      html: notificationEmailTemplate(data.fullName || data.to, data.title, data.body),
    });
  }
}

export const notificationsService = new NotificationsService();
