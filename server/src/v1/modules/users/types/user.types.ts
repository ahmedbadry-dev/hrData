import { User, UserStatus } from '@generated/prisma';
import { PaginationMeta } from '@/shared/utils/api-response';

export type SafeUser = Omit<
  User,
  'passwordHash' | 'verificationToken' | 'resetToken' | 'failedLoginAttempts'
>;

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  joinDate: Date;
  accountStatus: UserStatus;
}

export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: PaginationMeta;
}

export type UpdateUserResponse = UserResponse;

export type SuspendUserResponse = UserResponse;

export type ActivateUserResponse = UserResponse;
