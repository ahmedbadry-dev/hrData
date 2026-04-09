import assert from 'node:assert/strict';
import test from 'node:test';

import { UnauthorizedException } from '../src/shared/errors/UnauthorizedException';
import { AuthService } from '../src/v1/modules/auth/auth.service';

test('refresh rejects malformed or invalid refresh token values', async () => {
  const prisma = {
    user: {
      findUnique: async () => null,
      update: async () => null,
    },
  };

  const service = new AuthService(prisma as never);

  await assert.rejects(
    () => service.refresh('not-a-valid-jwt-token'),
    (error: unknown) =>
      error instanceof UnauthorizedException &&
      error.message === 'Invalid or expired refresh token'
  );
});
