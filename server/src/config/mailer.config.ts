import nodemailer from 'nodemailer';
import { emailConfig } from './env.config';
import logger from '@/shared/utils/logger.util';

export const transporterSingleton = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.port === 465, // true for 465, false for 587
  ...(emailConfig.user &&
    emailConfig.password && {
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    }),
});

// Verify connection on startup
transporterSingleton.verify((error) => {
  if (error) {
    logger.error('❌ Mailer connection failed:', error);
  } else {
    logger.info('✅ Mailer ready');
  }
});
