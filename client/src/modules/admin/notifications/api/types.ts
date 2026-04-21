import { NotificationType, NotificationTarget } from '@/constants/enums';

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  target: NotificationTarget;
  isRead: boolean;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface PaginatedNotifications {
  notifications: AdminNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateNotificationRequest {
  title: string;
  body: string;
  type: NotificationType;
  target: NotificationTarget;
}
