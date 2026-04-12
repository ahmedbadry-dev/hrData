import IORedis from 'ioredis';
import { redisConfig } from './env.config';
import logger from '@/shared/utils/logger.util';

const redis = new IORedis({
  host: redisConfig.host,
  port: redisConfig.port,

  maxRetriesPerRequest: null,

  enableReadyCheck: false,
});

redis.on('connect', () => logger.info('[Redis] ✅ Connected'));
redis.on('error', (err) => logger.error('[Redis] ❌ Error:', err.message));

export default redis;
