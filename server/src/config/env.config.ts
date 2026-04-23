import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
  dotenv.config();
}

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

const hasInsecureSecretPattern = (value: string): boolean => {
  const normalized = value.toLowerCase();
  return (
    normalized.includes('change-in-production') ||
    normalized.includes('your-super-secret') ||
    normalized.includes('default-encryption-key')
  );
};

const ensureMinLength = (key: string, value: string, minLength: number): string => {
  if (value.length < minLength) {
    throw new Error(`Environment variable ${key} must be at least ${minLength} characters.`);
  }

  if (hasInsecureSecretPattern(value)) {
    throw new Error(`Environment variable ${key} contains an insecure placeholder value.`);
  }

  return value;
};

const ensureHexLength = (key: string, value: string, expectedHexLength: number): string => {
  const normalized = value.trim();
  const hexPattern = /^[0-9a-fA-F]+$/;

  if (normalized.length !== expectedHexLength || !hexPattern.test(normalized)) {
    throw new Error(
      `Environment variable ${key} must be a ${expectedHexLength}-character hex string.`
    );
  }

  return normalized;
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
  accessSecret: ensureMinLength('JWT_ACCESS_SECRET', getEnvVariable('JWT_ACCESS_SECRET'), 32),
  accessExpiresIn: getEnvVariable('JWT_ACCESS_EXPIRES_IN', '15m'),
  refreshSecret: ensureMinLength('JWT_REFRESH_SECRET', getEnvVariable('JWT_REFRESH_SECRET'), 32),
  refreshExpiresIn: getEnvVariable('JWT_REFRESH_EXPIRES_IN', '7d'),
  verificationSecret: ensureMinLength(
    'JWT_VERIFICATION_TEMP_SECRET',
    getEnvVariable(
      'JWT_VERIFICATION_TEMP_SECRET',
      appConfig.isProduction ? undefined : 'kafoo-verification-secret-development-only-0000000000'
    ),
    32
  ),
  verificationExpiresIn: getEnvVariable('JWT_VERIFICATION_EXPIRES_IN', '15m'),
};

export const dbConfig = {
  databaseUrl: getEnvVariable('DATABASE_URL'),
  databaseName: getEnvVariable('DATABASE_NAME'),
};

export const redisConfig = {
  host: getEnvVariable('REDIS_HOST', 'localhost'),
  port: getEnvVarAsNumber('REDIS_PORT', 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  url: process.env.REDIS_URL || undefined,
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
  password: getEnvVariable('SMTP_PASSWORD', ''),
  secure:
    process.env.SMTP_SECURE !== undefined
      ? getEnvVarAsBoolean('SMTP_SECURE')
      : getEnvVarAsNumber('SMTP_PORT', 587) === 465,
  from: getEnvVariable('EMAIL_FROM', 'noreply@kafoo.com'),
  serverUrl: getEnvVariable('SERVER_URL', 'http://localhost:5000'),
  allowSelfSignedTls: getEnvVarAsBoolean('SMTP_ALLOW_SELF_SIGNED_TLS', false),
};

export const resendConfig = {
  resendApiKey: getEnvVariable('RESEND_API_KEY', ''),
  from: getEnvVariable('RESEND_EMAIL_FROM', 'noreply@kafoo.com'),
};

export const gmailOAuthConfig = {
  clientId: getEnvVariable('GMAIL_OAUTH_CLIENT_ID', ''),
  clientSecret: getEnvVariable('GMAIL_OAUTH_CLIENT_SECRET', ''),
  redirectUri: getEnvVariable(
    'GMAIL_OAUTH_REDIRECT_URI',
    `${emailConfig.serverUrl}/api/v1/gmail/callback`
  ),
  scope: getEnvVariable(
    'GMAIL_OAUTH_SCOPE',
    'openid email https://www.googleapis.com/auth/gmail.send'
  ),
};

export const encryptionConfig = {
  encryptionKey: ensureHexLength('ENCRYPTION_KEY', getEnvVariable('ENCRYPTION_KEY'), 64),
};

export const env = {
  appConfig,
  dbConfig,
  redisConfig,
  corsConfig,
  emailConfig,
  gmailOAuthConfig,
  encryptionConfig,
};
