import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/shared/utils/jwt.util';
import { jwtConfig } from '@/config/env';
import { UnauthorizedException } from '@/shared/errors/UnauthorizedException';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticationMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, jwtConfig.accessSecret);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

