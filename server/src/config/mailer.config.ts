import nodemailer from 'nodemailer';
import { emailConfig } from './env.config';
import logger from '@/shared/utils/logger.util';

export const transporterSingleton = nodemailer.createTransport({
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
});

transporterSingleton.verify((error) => {
  if (error) {
    logger.error('❌ Mailer connection failed:', error);
  } else {
    logger.info('✅ Mailer ready');
  }
});
