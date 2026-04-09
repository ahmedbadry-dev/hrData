import assert from 'node:assert/strict';
import test from 'node:test';

import { AuthController } from '../src/v1/modules/auth/auth.controller';
import { authRoutes } from '../src/v1/modules/auth/auth.routes';

type RouteHandler = (req: unknown, res: unknown, next: (error?: unknown) => void) => Promise<unknown>;

const getLastRouteHandler = (router: unknown, path: string, method: string): RouteHandler => {
  const stack = (router as { stack: Array<unknown> }).stack;
  const routeLayer = stack.find((layer) => {
    const route = (layer as { route?: { path?: string; methods?: Record<string, boolean> } }).route;
    return route?.path === path && route.methods?.[method] === true;
  }) as { route: { stack: Array<{ handle: RouteHandler }> } } | undefined;

  if (!routeLayer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }

  const handler = routeLayer.route.stack.at(-1)?.handle;
  if (!handler) {
    throw new Error(`No handler found for ${method.toUpperCase()} ${path}`);
  }

  return handler;
};

test('auth routes use bound controller handlers', async () => {
  let capturedContext: unknown;

  const mockService = {
    register: async (email: string, password: string, firstName: string, lastName: string) => {
      capturedContext = { email, password, firstName, lastName };
      return {
        user: { id: 'user-1', email, role: 'USER' },
        accessToken: 'access',
        refreshToken: 'refresh',
      };
    },
    verifyEmail: async () => ({ message: 'ok' }),
    login: async () => ({ user: { id: 'user-1', email: 'e', role: 'USER' }, accessToken: 'a', refreshToken: 'r' }),
    logout: async () => ({ message: 'ok' }),
    logoutAll: async () => ({ message: 'ok' }),
    refresh: async () => ({ accessToken: 'a', refreshToken: 'r' }),
    forgotPassword: async () => ({ message: 'ok' }),
    resetPassword: async () => ({ message: 'ok' }),
    changePassword: async () => ({ message: 'ok' }),
    revokeSession: async () => ({ message: 'ok' }),
  };

  const controller = new AuthController(mockService as never);
  const router = authRoutes(controller);
  const registerHandler = getLastRouteHandler(router, '/register', 'post');

  const req = {
    body: {
      email: 'user@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    },
    path: '/register',
  };

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

  await assert.doesNotReject(async () => {
    await registerHandler(req, res, () => undefined);
  });

  assert.deepEqual(capturedContext, {
    email: 'user@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  });
  assert.equal(res.statusCode, 201);
});
