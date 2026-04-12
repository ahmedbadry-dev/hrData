import assert from 'node:assert/strict';
import test from 'node:test';

import { UnauthorizedException } from '../src/shared/errors/UnauthorizedException';
import { createAuthenticationMiddleware } from '../src/http/middlewares/auth.middleware';
import { generateAccessToken } from '../src/shared/utils/jwt.util';

const runAuthMiddleware = async (
  authorization: string | undefined,
  userForLookup?: unknown
): Promise<{
  req: { headers: Record<string, string | undefined>; user?: unknown };
  error?: unknown;
}> => {
  const authenticationMiddleware = createAuthenticationMiddleware({
    user: {
      findUnique: async () => userForLookup,
    },
  } as never);

  const req: { headers: Record<string, string | undefined>; user?: unknown } = { headers: {} };
  if (authorization !== undefined) {
    req.headers.authorization = authorization;
  }

  return new Promise((resolve) => {
    Promise.resolve(
      authenticationMiddleware(req as never, {} as never, (error?: unknown) => {
        resolve({ req, error });
      })
    )
      .then(() => resolve({ req }))
      .catch((error: unknown) => resolve({ req, error }));
  });
};

test('authentication middleware rejects malformed bearer tokens', async () => {
  const result = await runAuthMiddleware('Bearer');

  assert.ok(result.error instanceof UnauthorizedException);
  assert.equal(
    (result.error as UnauthorizedException).message,
    'Authentication required. Please provide a valid token.'
  );
});

test('authentication middleware accepts valid tokens and injects user payload', async () => {
  const token = generateAccessToken({
    userId: 'user-123',
    tokenId: 'session-123',
    email: 'user@example.com',
    role: 'ADMIN',
    type: 'ACCESS',
  });

  const result = await runAuthMiddleware(`Bearer ${token}`, {
    id: 'user-123',
    email: 'user@example.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    emailVerified: true,
    sessions: [{ id: 'session-123' }],
  });

  assert.equal(result.error, undefined);
  assert.equal((result.req.user as { id: string }).id, 'user-123');
});
