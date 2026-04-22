import { google } from 'googleapis';
import { PrismaClient } from '@generated/prisma';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';

import { gmailOAuthConfig } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';

export class GmailSender {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async sendEmail(
    userId: string,
    options: {
      to: string;
      subject: string;
      htmlBody: string;
      from?: string | undefined;
      replyTo?: string | undefined;
      attachments?: Array<{ filename: string; path?: string; content?: Buffer }> | undefined;
    }
  ): Promise<{ messageId: string }> {
    const token = await this.prisma.gmailToken.findUnique({
      where: { userId },
    });

    if (!token || !token.accessToken || !token.refreshToken) {
      throw new Error('User has not connected Gmail account');
    }

    if (token.tokenExpiry && new Date() >= new Date(token.tokenExpiry)) {
      const newToken = await this.refreshAccessToken(token.refreshToken);
      await this.prisma.gmailToken.update({
        where: { userId },
        data: {
          accessToken: newToken,
          tokenExpiry: new Date(Date.now() + 3600 * 1000),
        },
      });
      token.accessToken = newToken;
    }

    const auth = new google.auth.OAuth2(
      gmailOAuthConfig.clientId,
      gmailOAuthConfig.clientSecret,
      gmailOAuthConfig.redirectUri
    );
    auth.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth });

    const mailOptions: any = {
      to: options.to,
      subject: options.subject,
      html: options.htmlBody,
      replyTo: options.replyTo,
    };

    if (options.attachments && options.attachments.length > 0) {
      const fs = await import('fs/promises');
      mailOptions.attachments = [];
      for (const attachment of options.attachments) {
        let fileBuffer: Buffer;
        if (attachment.content) {
          fileBuffer = attachment.content;
        } else if (attachment.path) {
          fileBuffer = await fs.readFile(attachment.path);
        } else {
          continue;
        }
        mailOptions.attachments.push({
          filename: attachment.filename,
          content: fileBuffer,
          contentType: 'application/pdf',
        });
      }
    }

    const mailComposer = new MailComposer(mailOptions);
    const rawMessage = await mailComposer.compile().build();

    const base64Message = rawMessage.toString('base64');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64Message.replace(/\+/g, '-').replace(/\//g, '_'),
      },
    });

    const messageId = response.data.id;
    if (!messageId) {
      throw new Error('Failed to send email: no message ID returned');
    }

    logger.info(`✅ Email sent via Gmail API to ${options.to} — messageId: ${messageId}`);

    return { messageId };
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const auth = new google.auth.OAuth2(
      gmailOAuthConfig.clientId,
      gmailOAuthConfig.clientSecret,
      gmailOAuthConfig.redirectUri
    );

    auth.setCredentials({
      refresh_token: refreshToken,
    });

    const credentials = await auth.getAccessToken();
    return credentials.token || '';
  }
}
