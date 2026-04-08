import Redis from 'ioredis';
import { env } from '@/config/env';
import logger from '@/shared/utils/logger.util';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.warn('Redis connection error', err.message);
});
