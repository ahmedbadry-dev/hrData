import { User, UserStatus, UserRole } from 'generated/prisma';
import { PaginationMeta } from '@/shared/utils/api-response';

export type SafeUser = Omit<
  User,
  | 'passwordHash'
  | 'verificationToken'
  | 'resetToken'
  | 'failedLoginAttempts'
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

export interface UpdateUserResponse extends UserResponse {}

export interface SuspendUserResponse extends UserResponse {}

export interface ActivateUserResponse extends UserResponse {}
