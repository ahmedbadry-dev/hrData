import { SafeUser } from '@/v1/modules/users/types/user.types';
import { User } from '@prisma/client';

export function excludePassword(user: User): SafeUser {
  const { passwordHash, verificationToken, resetToken, failedLoginAttempts, ...safeUser } = user;
  return safeUser;
}
