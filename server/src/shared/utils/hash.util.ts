import bcrypt from 'bcrypt';
import crypto from 'crypto';
const SALT_ROUNDS = 12;

export const generateHash = async (
  textToHash: string,
): Promise<string> => {
  return await bcrypt.hash(textToHash, SALT_ROUNDS);
};

export const compareHash = async (
  textToCompare: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(textToCompare, hash);
};

export const generateHashedWithSha256 = (text: string): string => {
  return crypto.createHash('sha256').update(text).digest('hex');
};