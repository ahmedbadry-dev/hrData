import assert from 'node:assert/strict';
import test from 'node:test';

import jwt from 'jsonwebtoken';
import { errorHandlerMiddleware } from '../src/http/middlewares/error-handler';

test('global error handler maps JWT errors to 401 unauthorized', () => {
  const req = { path: '/api/v1/auth/logout' };
  const res = {
    statusCode: 0,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.payload = body;
      return this;
    },
  };

  errorHandlerMiddleware(
    new jwt.JsonWebTokenError('invalid token'),
    req as never,
    res as never,
    (() => undefined) as never
  );

  const payload = res.payload as { statusCode: number; message: string };

  assert.equal(res.statusCode, 401);
  assert.equal(payload.statusCode, 401);
  assert.equal(payload.message, 'Invalid or expired token');
});
