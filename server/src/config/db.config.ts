import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { appConfig, dbConfig } from './env.config';
import logger from '@/shared/utils/logger.util';
import { PrismaClient } from 'generated/prisma';

const connectionString = dbConfig.databaseUrl;

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: appConfig.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (appConfig.isDevelopment) globalForPrisma.prisma = prisma;

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
