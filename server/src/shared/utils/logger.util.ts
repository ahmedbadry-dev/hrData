import { createLogger, format, transports } from 'winston';
import { appConfig } from '@/config/env.config';

const consoleFormat = format.combine(
  format.timestamp(),
  appConfig.isDevelopment ? format.colorize() : format.uncolorize(),
  format.splat(),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

const logger = createLogger({
  level: 'info',
  format: consoleFormat,
  transports: [new transports.Console({ format: consoleFormat })],
});

export default logger;
