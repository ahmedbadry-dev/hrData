export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum ApplicationStatus {
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_OPENED = 'EMAIL_OPENED',
  EMAIL_FAILED = 'EMAIL_FAILED',
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
}

export enum NotificationTarget {
  ALL = 'ALL',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum JobLocation {
  RIYADH = 'RIYADH',
  JEDDAH = 'JEDDAH',
  DAMMAM = 'DAMMAM',
  KHOBAR = 'KHOBAR',
  MECCA = 'MECCA',
  MEDINA = 'MEDINA',
  TABUK = 'TABUK',
}

export enum DateFilter {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export const ALLOWED_ADMIN_ROLES: string[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
