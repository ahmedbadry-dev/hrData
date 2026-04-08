import nodemailer from 'nodemailer';
import { emailConfig } from '@/config/env';
import logger from '@/shared/utils/logger.util';

export const mailer = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.port === 465,
  auth: emailConfig.user ? { user: emailConfig.user, pass: emailConfig.password } : undefined,
});

logger.info('Mailer transport created');
