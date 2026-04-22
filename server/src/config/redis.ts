import IORedis from 'ioredis';
import { redisConfig } from './env.config';
import logger from '@/shared/utils/logger.util';

const redis = redisConfig.url
  ? new IORedis(redisConfig.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })
  : new IORedis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

redis.on('connect', () => logger.info('[Redis] ✅ Connected'));
redis.on('error', (err) => logger.error('[Redis] ❌ Error:', err.message));

export default redis;
