import Redis from 'ioredis';
import { redisConfig } from '@/config/env.config';
import logger from '@/shared/utils/logger.util';

export const redis = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.warn('Redis connection error', err.message);
});
