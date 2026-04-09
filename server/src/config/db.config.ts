import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { appConfig } from './env.config';
import logger from '@/shared/utils/logger.util';
import { PrismaClient } from 'generated/prisma';

const connectionString = process.env.DATABASE_URL;

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: appConfig.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
};

declare const globalThis: {
  prisma: ReturnType<typeof prismaClientSingleton>;
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (appConfig.isDevelopment) globalThis.prisma = prisma;

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Database disconnection error:', error);
  }
};

export default prisma;
