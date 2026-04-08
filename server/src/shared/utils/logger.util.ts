import { createLogger, format, transports } from 'winston';
import { appConfig } from '@/config/env';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    appConfig.isDevelopment ? format.colorize() : format.uncolorize(),
    format.splat(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        appConfig.isDevelopment ? format.colorize() : format.uncolorize(),
        format.splat(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
  ],
});

export default logger;
