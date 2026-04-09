import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { dbConfig } from '@/config/env';

const adapter = new PrismaPg({ connectionString: dbConfig.databaseUrl });
const prisma = new PrismaClient({ adapter });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export type PrismaClientType = PrismaClient;
export default prisma;
