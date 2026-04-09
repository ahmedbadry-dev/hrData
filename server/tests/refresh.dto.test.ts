import assert from 'node:assert/strict';
import test from 'node:test';

import { ZodError } from 'zod';
import { RefreshDtoSchema } from '../src/v1/modules/auth/dto/refresh.dto';

test('refresh DTO rejects empty refresh token', () => {
  assert.throws(() => RefreshDtoSchema.parse({ refreshToken: '' }), (error: unknown) => {
    return error instanceof ZodError;
  });
});

test('refresh DTO accepts valid refresh token body', () => {
  const parsed = RefreshDtoSchema.parse({ refreshToken: 'refresh-token-value' });

  assert.equal(parsed.refreshToken, 'refresh-token-value');
});
