import bcrypt from 'bcrypt';
import { APP_CONSTANTS } from '@/config/constants';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
