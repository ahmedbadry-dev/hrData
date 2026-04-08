import prisma from '@/config/prisma';
import { AppError } from '@/shared/errors/AppError';

export const healthService = {
  getBasicHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  },

  async getDatabaseHealth() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: 'connected' };
    } catch {
      throw new AppError('Database connection failed', 503, 'DB_CONNECTION_ERROR');
    }
  },
};
