import { NextFunction, Request, Response } from 'express';
import { UnauthorizedException } from '../../shared/errors/UnauthorizedException';
import { verifyAccessToken } from '@/shared/utils/jwt.util';
import prisma from '@/config/db.config';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

import { ForbiddenException } from '@/shared/errors/ForbiddenException';
import { excludePassword } from '@/shared/utils/exclude-password.utils';

type UserLookupClient = Pick<PrismaClient, 'user'>;

export const createAuthenticationMiddleware = (db: UserLookupClient) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const [type, token] = authHeader?.split(' ') || [];

    if (!token || type !== 'Bearer') {
      throw new UnauthorizedException('Authentication required. Please provide a valid token.');
    }

    const verified = verifyAccessToken(token);

    if (!verified.valid) {
      throw new UnauthorizedException(verified.error || 'Invalid access token');
    }

    const user = await db.user.findUnique({
      where: {
        id: verified.payload.userId,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or account inactive. Please login again.');
    }

    req.user = excludePassword(user);
    next();
  };
};

export const authenticationMiddleware = createAuthenticationMiddleware(prisma);

export const authorizationMiddleware = (...roles: Array<UserRole>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenException('This action is not allowed for this user');
    }
    next();
  };
};
