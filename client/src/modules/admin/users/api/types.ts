import { UserStatus } from '@/constants/enums';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  joinDate: string;
  accountStatus: UserStatus;
  appliedCount?: number;
  savedCount?: number;
  quota?: AdminUserQuota;
}

export interface AdminUserQuota {
  emailsUsedToday: number;
  dailyEmailLimit: number;
  remaining: number;
  resetsAt: string | null;
  lastQuotaResetAt: string | null;
  canRestore: boolean;
}

export interface PaginatedUsers {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  accountStatus?: UserStatus.ACTIVE | UserStatus.SUSPENDED;
}

export interface RestoreUserQuotaRequest {
  reason: string;
}

export interface RestoreUserQuotaResponse {
  quota: AdminUserQuota;
  reset: {
    id: string;
    userId: string;
    resetById: string | null;
    reason: string;
    createdAt: string;
  };
}
