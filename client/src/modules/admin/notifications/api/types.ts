export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warn' | 'success' | 'danger';
  target: string;
  isRead: boolean;
  createdAt: string;
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
  type: 'info' | 'warn' | 'success' | 'danger';
  target: string;
}
