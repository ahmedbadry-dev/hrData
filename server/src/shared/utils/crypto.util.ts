import crypto from 'node:crypto';
import { encryptionConfig } from '@/config/env.config';

const ALGORITHM = 'aes-256-gcm';
const HEX_PATTERN = /^[0-9a-fA-F]+$/;

const isValidHex = (value: string): boolean => {
  return value.length > 0 && value.length % 2 === 0 && HEX_PATTERN.test(value);
};

export const encrypt = (plaintext: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(encryptionConfig.encryptionKey, 'hex'),
    iv
  );
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
};

export const decrypt = (ciphertext: string): string => {
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format');
  }

  const [ivHex, encrypted, authTagHex] = parts;
  if (
    !ivHex ||
    !encrypted ||
    !authTagHex ||
    ivHex.length !== 32 ||
    authTagHex.length !== 32 ||
    !isValidHex(ivHex) ||
    !isValidHex(encrypted) ||
    !isValidHex(authTagHex)
  ) {
    throw new Error('Invalid ciphertext format');
  }

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(encryptionConfig.encryptionKey, 'hex'),
      iv
    );
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    throw new Error('Failed to decrypt ciphertext');
  }
};
