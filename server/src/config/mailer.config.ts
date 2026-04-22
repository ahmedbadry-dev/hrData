import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { emailConfig } from './env.config';
import logger from '@/shared/utils/logger.util';

const smtpOptions: SMTPTransport.Options = {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth:
    emailConfig.user && emailConfig.password
      ? {
          user: emailConfig.user,
          pass: emailConfig.password,
        }
      : undefined,
  tls: {
    rejectUnauthorized: !emailConfig.allowSelfSignedTls,
    // Helping with some cloud provider network restrictions
    minVersion: 'TLSv1.2',
  },
  // Adding timeouts to prevent hanging
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
};

export const transporterSingleton = nodemailer.createTransport(smtpOptions);

transporterSingleton.verify((error) => {
  if (error) {
    logger.error('❌ Mailer connection failed:', error);
  } else {
    logger.info('✅ Mailer ready');
  }
});
