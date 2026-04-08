import { createLogger, format, transports } from 'winston';
import { env } from '@/config/env';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    env.NODE_ENV === 'development' ? format.colorize() : format.uncolorize(),
    format.splat(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        env.NODE_ENV === 'development' ? format.colorize() : format.uncolorize(),
        format.splat(),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
  ],
});

export default logger;
