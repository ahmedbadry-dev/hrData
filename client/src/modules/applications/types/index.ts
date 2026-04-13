export type ApplicationStatusType =
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED'
  | 'EMAIL_SENT'
  | 'EMAIL_OPENED'
  | 'EMAIL_FAILED';

export interface ApplicationJob {
  id: string;
  title: string;
  companyName: string;
  hrEmail: string | null;
  category: string | null;
  location: string | null;
}

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatusType;
  scheduledAt: string | null;
  sentAt: string | null;
  openedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  job: ApplicationJob;
}

export interface PaginatedApplications {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ScheduleApplicationsRequest {
  jobIds: string[];
  sendTime: string;
  delayBetweenEmails?: number;
  cv?: File;
}

export interface ScheduleApplicationsResponse {
  scheduledCount: number;
  applicationIds: string[];
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatusType, string> = {
  SCHEDULED: 'مجدولة',
  SENDING: 'قيد الارسال',
  SENT: 'تم الإرسال',
  FAILED: 'فشلت',
  EMAIL_SENT: 'تم الإرسال',
  EMAIL_OPENED: 'تم الاطلاع',
  EMAIL_FAILED: 'فشل الارسال',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatusType, string> = {
  SCHEDULED: 'var(--warm)',
  SENDING: 'var(--accent)',
  SENT: 'var(--green)',
  FAILED: 'var(--error)',
  EMAIL_SENT: 'var(--green)',
  EMAIL_OPENED: 'var(--green)',
  EMAIL_FAILED: 'var(--error)',
};
