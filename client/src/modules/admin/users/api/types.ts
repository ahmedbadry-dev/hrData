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
