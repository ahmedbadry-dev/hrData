import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import logger from '@/shared/utils/logger.util';

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

logger.info('Mailer transport created');
