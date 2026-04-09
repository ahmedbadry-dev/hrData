import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';
import { appConfig, emailConfig } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';
import { transporterSingleton } from '@/config/mailer.config';

export class NotificationsService {
  constructor(
    private readonly transporter: Transporter<SMTPTransport.SentMessageInfo> = transporterSingleton,
    private readonly fromAddress: string = emailConfig.from
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
        return; // Success, exit
      } catch (error) {
        attempts++;
        logger.error(`❌ Attempt ${attempts} failed to send email to ${options.to}`, { error });

        if (attempts >= MAX_RETRIES) {
          logger.error(
            `🚨 All ${MAX_RETRIES} attempts failed to send email to ${options.to}. Giving up.`
          );
          return;
        }

        // Wait before retrying (simple linear backoff: 1s, 2s)
        await new Promise((resolve) => setTimeout(resolve, attempts * 1000));
      }
    }
  }

  async sendVerificationEmail(name: string, email: string, token: string): Promise<void> {
    const url = `${appConfig.appUrl}/api/v1/auth/verify-email?token=${token}`;
    await this.sendEmail({
      to: email,
      subject: 'Verify your email address',
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
}

export const notificationsService = new NotificationsService();
