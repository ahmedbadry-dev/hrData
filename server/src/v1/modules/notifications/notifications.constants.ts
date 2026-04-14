export const NOTIFICATIONS_ROUTES = {
  ADMIN_CREATE: '/create',
  ADMIN_LIST: '/',
  ADMIN_DELETE: '/:id',
  MY_NOTIFICATIONS: '/me',
  MARK_READ: '/:id/read',
  MARK_ALL_READ: '/read-all',
} as const;

export const NOTIFICATIONS_MESSAGES = {
  CREATED: 'Notification sent successfully',
  LIST: 'Notifications retrieved successfully',
  DELETED: 'Notification deleted successfully',
  MARKED_READ: 'Notification marked as read',
  ALL_MARKED: 'All notifications marked as read',
  NOT_FOUND: 'Notification not found',
} as const;
