import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger, format, transports } from 'winston';

import { appConfig } from '@/config/env.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, '..', '..', '..', 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const consoleFormat = format.combine(
  format.timestamp(),
  appConfig.isDevelopment ? format.colorize() : format.uncolorize(),
  format.splat(),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

const fileFormat = format.combine(
  format.timestamp(),
  format.uncolorize(),
  format.splat(),
  format.json()
);

const logger = createLogger({
  level: 'info',
  format: consoleFormat,
  transports: [
    new transports.Console({ format: consoleFormat }),
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
      format: fileFormat,
    }),
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 10,
      tailable: true,
      format: fileFormat,
    }),
  ],
});

export default logger;
