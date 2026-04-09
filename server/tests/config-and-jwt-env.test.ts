import assert from 'node:assert/strict';
import test from 'node:test';

import jwt from 'jsonwebtoken';

const withRequiredBaseEnv = () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/kafoo';
  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'access-secret-for-tests';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-for-tests';
};

test('env config reads redis host from REDIS_HOST', async () => {
  withRequiredBaseEnv();
  process.env.REDIS_HOST = 'redis.internal';

  const envModule = await import(`../src/config/env.ts?redis-host-${Date.now()}`);

  assert.equal(envModule.redisConfig.host, 'redis.internal');
});

test('jwt util uses configured expiry values from env', async () => {
  withRequiredBaseEnv();
  process.env.JWT_ACCESS_EXPIRES_IN = '2m';
  process.env.JWT_REFRESH_EXPIRES_IN = '3m';

  const jwtUtil = await import(`../src/shared/utils/jwt.util.ts?jwt-expiry-${Date.now()}`);

  const accessToken = jwtUtil.signAccessToken({ userId: 'user-1', role: 'USER' });
  const refreshToken = jwtUtil.signRefreshToken({ userId: 'user-1' });

  const decodedAccess = jwt.decode(accessToken) as { iat: number; exp: number };
  const decodedRefresh = jwt.decode(refreshToken) as { iat: number; exp: number };

  assert.equal(decodedAccess.exp - decodedAccess.iat, 120);
  assert.equal(decodedRefresh.exp - decodedRefresh.iat, 180);
});
