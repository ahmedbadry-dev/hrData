import { NotificationTarget, NotificationType } from 'generated/prisma';
import { PaginationMeta } from '@/shared/utils/api-response';

export interface CreateNotificationInput {
  title: string;
  body: string;
  type: NotificationType;
  target: NotificationTarget;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  target: NotificationTarget;
  isRead: boolean;
  createdAt: Date;
}

export interface AdminNotificationItem extends NotificationItem {
  userName?: string | undefined;
  userEmail?: string | undefined;
}

export interface AdminNotificationsListResult {
  notifications: AdminNotificationItem[];
  pagination: PaginationMeta;
}

export interface NotificationsListResult {
  notifications: NotificationItem[];
  pagination: PaginationMeta;
}
