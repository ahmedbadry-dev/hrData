import IORedis from 'ioredis';
import { redisConfig } from './env.config';

const redis = new IORedis({
  host: redisConfig.host,
  port: redisConfig.port,

  maxRetriesPerRequest: null,

  enableReadyCheck: false,
});

redis.on('connect', () => console.log('[Redis] ✅ Connected'));
redis.on('error', (err) => console.error('[Redis] ❌ Error:', err.message));

export default redis;
