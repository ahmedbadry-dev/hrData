import app from '@/app';
import { env } from '@/config/env';
import logger from '@/shared/utils/logger.util';

const server = app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
  server.close(() => process.exit(1));
});
