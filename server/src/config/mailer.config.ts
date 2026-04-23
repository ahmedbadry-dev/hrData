import { Resend } from 'resend';
import logger from '@/shared/utils/logger.util';
import { resendConfig } from './env.config';

export const resendClient = new Resend(resendConfig.resendApiKey);

if (process.env.NODE_ENV === 'development' && resendConfig.resendApiKey) {
  resendClient.emails
    .send({
      from: resendConfig.from,
      to: 'delivered@resend.dev',
      subject: 'Kafoo Mailer Ready',
      html: '<p>Mailer is configured correctly.</p>',
    })
    .then(() => logger.info('✅ Mailer ready (Test email sent)'))
    .catch((err) => logger.error('❌ Mailer test failed:', err.message));
}
