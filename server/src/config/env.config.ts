import 'dotenv/config';

export const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set and no default value provided.`);
  }
  return value;
};

export const getEnvVarAsNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return defaultValue;
  } else {
    const parsedValue = Number(value);
    if (isNaN(parsedValue)) {
      throw new Error(`Environment variable ${key} is not a number`);
    }
    return parsedValue;
  }
};

export const getEnvVarAsBoolean = (key: string, defaultValue?: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return defaultValue;
  }
  return value === 'true';
};

const nodeEnv = getEnvVariable('NODE_ENV', 'development');

export const appConfig = {
  appUrl: getEnvVariable('APP_URL', 'http://localhost:5173'),
  port: getEnvVarAsNumber('PORT', 5000),
  nodeEnv,
  apiVersion: 'v1',
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
};

export const jwtConfig = {
  accessSecret: getEnvVariable('JWT_ACCESS_SECRET'),
  accessExpiresIn: getEnvVariable('JWT_ACCESS_EXPIRES_IN', '15m'),
  refreshSecret: getEnvVariable('JWT_REFRESH_SECRET'),
  refreshExpiresIn: getEnvVariable('JWT_REFRESH_EXPIRES_IN', '7d'),
  verificationSecret: getEnvVariable(
    'JWT_VERIFICATION_TEMP_SECRET',
    appConfig.isProduction ? undefined : 'kafoo-verification-secret-123'
  ),
  verificationExpiresIn: getEnvVariable('JWT_VERIFICATION_EXPIRES_IN', '15m'),
};

export const dbConfig = {
  databaseUrl: getEnvVariable('DATABASE_URL'),
};

export const redisConfig = {
  host: getEnvVariable('REDIS_HOST', 'localhost'),
  port: getEnvVarAsNumber('REDIS_PORT', 6379),
};

export const corsConfig = {
  allowedOrigins: getEnvVariable('CORS_ALLOWED_ORIGINS', appConfig.appUrl)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export const emailConfig = {
  host: getEnvVariable('SMTP_HOST', 'smtp.ethereal.email'),
  port: getEnvVarAsNumber('SMTP_PORT', 587),
  user: getEnvVariable('SMTP_USER', ''),
  password: getEnvVariable('SMTP_PASS', ''),
  from: getEnvVariable('EMAIL_FROM', 'noreply@kafoo.com'),
};

export const encryptionConfig = {
  encryptionKey: getEnvVariable('ENCRYPTION_KEY'),
};

export const env = {
  appConfig,
  dbConfig,
  redisConfig,
  corsConfig,
  emailConfig,
  encryptionConfig,
};
