import { User, UserStatus } from '@prisma/client';
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
  quota?: UserEmailQuotaResponse;
}

export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: PaginationMeta;
}

export interface UserEmailQuotaResponse {
  emailsUsedToday: number;
  dailyEmailLimit: number;
  remaining: number;
  resetsAt: Date | null;
  lastQuotaResetAt: Date | null;
  canRestore: boolean;
}

export interface RestoreUserQuotaResponse {
  quota: UserEmailQuotaResponse;
  reset: {
    id: string;
    userId: string;
    resetById: string | null;
    reason: string;
    createdAt: Date;
  };
}

export type UpdateUserResponse = UserResponse;

export type SuspendUserResponse = UserResponse;

export type ActivateUserResponse = UserResponse;
