import 'dotenv/config';
import { z } from 'zod';
export const env = z
  .object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().url(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    ENCRYPTION_KEY: z.string().min(32),
    SMTP_HOST: z.string().default('smtp.ethereal.email'),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional().default(''),
    SMTP_PASS: z.string().optional().default(''),
    LLM_API_KEY: z.string().optional().default(''),
    LLM_BASE_URL: z.string().optional().default(''),
    APP_URL: z.string().default('http://localhost:5173'),
    API_URL: z.string().default('http://localhost:5000'),
  })
  .parse(process.env);
