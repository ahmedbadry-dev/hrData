import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { APP_CONSTANTS } from '@/config/constants';

export const generateHash = async (textToHash: string): Promise<string> => {
  return await bcrypt.hash(textToHash, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
};

export const compareHash = async (textToCompare: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(textToCompare, hash);
};

export const generateHashedWithSha256 = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};
