import assert from 'node:assert/strict';
import test from 'node:test';

import bcrypt from 'bcrypt';
import { APP_CONSTANTS } from '../src/config/constants';
import { ForbiddenException } from '../src/shared/errors/ForbiddenException';
import { UnauthorizedException } from '../src/shared/errors/UnauthorizedException';
import { AuthService } from '../src/v1/modules/auth/auth.service';

const buildPrismaMock = (user: Record<string, unknown>) => {
  const updates: Array<{ where: unknown; data: Record<string, unknown> }> = [];

  return {
    prisma: {
      user: {
        findUnique: async () => user,
        update: async (args: { where: unknown; data: Record<string, unknown> }) => {
          updates.push(args);
          return { ...user, ...args.data };
        },
      },
    },
    updates,
  };
};

test('login blocks unverified users before password checks', async () => {
  const { prisma } = buildPrismaMock({
    id: 'user-1',
    email: 'user@example.com',
    role: 'USER',
    status: 'PENDING_VERIFICATION',
    emailVerified: false,
    lockedUntil: null,
    passwordHash: 'unused',
    failedLoginAttempts: 0,
  });

  const service = new AuthService(prisma as never);

  await assert.rejects(
    () => service.login('user@example.com', 'password123'),
    (error: unknown) =>
      error instanceof ForbiddenException &&
      error.message === 'Please verify your email before logging in'
  );
});

test('login applies lockout duration from constants at threshold', async () => {
  const passwordHash = await bcrypt.hash('correct-password', APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
  const { prisma, updates } = buildPrismaMock({
    id: 'user-2',
    email: 'user2@example.com',
    role: 'USER',
    status: 'ACTIVE',
    emailVerified: true,
    lockedUntil: null,
    passwordHash,
    failedLoginAttempts: APP_CONSTANTS.MAX_FAILED_LOGIN_ATTEMPTS - 1,
  });

  const service = new AuthService(prisma as never);

  await assert.rejects(
    () => service.login('user2@example.com', 'wrong-password'),
    (error: unknown) => error instanceof UnauthorizedException
  );

  assert.equal(updates.length, 1);
  assert.equal(updates[0].data.failedLoginAttempts, APP_CONSTANTS.MAX_FAILED_LOGIN_ATTEMPTS);
  assert.ok(updates[0].data.lockedUntil instanceof Date);

  const lockoutEnd = updates[0].data.lockedUntil as Date;
  const remainingMs = lockoutEnd.getTime() - Date.now();
  const expectedMs = APP_CONSTANTS.LOCKOUT_DURATION_MINUTES * 60 * 1000;

  assert.ok(remainingMs <= expectedMs);
  assert.ok(remainingMs >= expectedMs - 10_000);
});
