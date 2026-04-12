import assert from 'node:assert/strict';
import test from 'node:test';

import bcrypt from 'bcrypt';
import { BadRequestException } from '../src/shared/errors/BadRequestException';
import { UnauthorizedException } from '../src/shared/errors/UnauthorizedException';
import { AUTH_CONSTANTS } from '../src/v1/modules/auth/auth.constants';
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

const mockDeviceInfo = {
  ipAddress: '127.0.0.1',
  userAgent: 'test-agent',
  deviceName: 'test-device',
};

test('login blocks unverified users before password checks', async () => {
  const passwordHash = await bcrypt.hash('password123', 12);

  const { prisma } = buildPrismaMock({
    id: 'user-1',
    email: 'user@example.com',
    role: 'USER',
    status: 'PENDING_VERIFICATION',
    emailVerified: false,
    lockedUntil: null,
    passwordHash,
    failedLoginAttempts: 0,
  });

  const service = new AuthService(prisma as never);

  await assert.rejects(
    () =>
      service.login(
        {
          email: 'user@example.com',
          password: 'password123',
        },
        mockDeviceInfo
      ),
    (error: unknown) =>
      error instanceof BadRequestException && error.message === 'Please verify your email first'
  );
});

test('login applies lockout duration from constants at threshold', async () => {
  const passwordHash = await bcrypt.hash('correct-password', 12);
  const { prisma, updates } = buildPrismaMock({
    id: 'user-2',
    email: 'user2@example.com',
    role: 'USER',
    status: 'ACTIVE',
    emailVerified: true,
    lockedUntil: null,
    passwordHash,
    failedLoginAttempts: AUTH_CONSTANTS.MAX_FAILED_LOGIN_ATTEMPTS - 1,
  });

  const service = new AuthService(prisma as never);

  await assert.rejects(
    () =>
      service.login(
        {
          email: 'user2@example.com',
          password: 'wrong-password',
        },
        mockDeviceInfo
      ),
    (error: unknown) => error instanceof UnauthorizedException
  );

  assert.equal(updates.length, 1);
  assert.equal(updates[0].data.failedLoginAttempts, AUTH_CONSTANTS.MAX_FAILED_LOGIN_ATTEMPTS);
  assert.ok(updates[0].data.lockedUntil instanceof Date);

  const lockoutEnd = updates[0].data.lockedUntil as Date;
  const remainingMs = lockoutEnd.getTime() - Date.now();
  const expectedMs = AUTH_CONSTANTS.LOCKOUT_DURATION_MS;

  assert.ok(remainingMs <= expectedMs);
  assert.ok(remainingMs >= expectedMs - 10_000);
});
