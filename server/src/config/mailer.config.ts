import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { emailConfig } from './env.config';
import logger from '@/shared/utils/logger.util';

const smtpOptions: SMTPTransport.Options = {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.port === 465,
  auth:
    emailConfig.user && emailConfig.password
      ? {
          user: emailConfig.user,
          pass: emailConfig.password,
        }
      : undefined,
  tls: {
    rejectUnauthorized: false,
  },
};

export const transporterSingleton = nodemailer.createTransport(smtpOptions);

transporterSingleton.verify((error) => {
  if (error) {
    logger.error('❌ Mailer connection failed:', error);
  } else {
    logger.info('✅ Mailer ready');
  }
});
