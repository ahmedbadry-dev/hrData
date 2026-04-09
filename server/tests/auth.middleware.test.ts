import assert from 'node:assert/strict';
import test from 'node:test';

import { UnauthorizedException } from '../src/shared/errors/UnauthorizedException';
import { authenticationMiddleware, AuthRequest } from '../src/http/middlewares/auth.middleware';
import { signAccessToken } from '../src/shared/utils/jwt.util';

const runAuthMiddleware = async (
  authorization: string | undefined
): Promise<{ req: AuthRequest; error?: unknown }> => {
  const req = { headers: {} } as AuthRequest;
  if (authorization !== undefined) {
    req.headers.authorization = authorization;
  }

  return new Promise((resolve) => {
    authenticationMiddleware(req, {} as never, (error?: unknown) => {
      resolve({ req, error });
    });
  });
};

test('authentication middleware rejects malformed bearer tokens', async () => {
  const result = await runAuthMiddleware('Bearer');

  assert.ok(result.error instanceof UnauthorizedException);
  assert.equal((result.error as UnauthorizedException).message, 'Invalid token format');
});

test('authentication middleware accepts valid tokens and injects user payload', async () => {
  const token = signAccessToken({ userId: 'user-123', role: 'ADMIN' });
  const result = await runAuthMiddleware(`Bearer ${token}`);

  assert.equal(result.error, undefined);
  assert.deepEqual(result.req.user, { userId: 'user-123', role: 'ADMIN' });
});
