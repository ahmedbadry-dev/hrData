import Redis from 'ioredis';
import { appConfig, getEnvVarAsNumber } from '@/config/env';
import logger from '@/shared/utils/logger.util';

export const redis = new Redis({
  host: appConfig.isDevelopment ? 'localhost' : 'localhost',
  port: getEnvVarAsNumber('REDIS_PORT', 6379),
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.warn('Redis connection error', err.message);
});
