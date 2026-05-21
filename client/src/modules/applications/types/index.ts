import { ApplicationStatus } from '@/constants/enums';

export { ApplicationStatus };

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
  status: ApplicationStatus;
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
  emailsUsedToday: number;
  dailyEmailLimit: number;
  remaining: number;
  resetsAt: string | null;
}

export interface ApplicationsQuota {
  emailsUsedToday: number;
  dailyEmailLimit: number;
  remaining: number;
  resetsAt: string | null;
}

export interface ScheduleApplicationsRequest {
  jobIds: string[];
  sendTime: string;
  delayBetweenEmails?: number;
  cv?: File;
  emailBody?: string;
}

export interface ScheduleApplicationsResponse extends ApplicationsQuota {
  requestedCount: number;
  scheduledCount: number;
  skippedCount: number;
  cappedByLimit: boolean;
  applicationIds: string[];
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SCHEDULED]: 'مجدولة',
  [ApplicationStatus.SENDING]: 'قيد الارسال',
  [ApplicationStatus.SENT]: 'تم الإرسال',
  [ApplicationStatus.FAILED]: 'فشلت',
  [ApplicationStatus.CANCELLED]: 'ملغي',
  [ApplicationStatus.EMAIL_SENT]: 'تم الإرسال',
  [ApplicationStatus.EMAIL_OPENED]: 'تم الاطلاع',
  [ApplicationStatus.EMAIL_FAILED]: 'فشل الارسال',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SCHEDULED]: 'var(--warm)',
  [ApplicationStatus.SENDING]: 'var(--accent)',
  [ApplicationStatus.SENT]: 'var(--green)',
  [ApplicationStatus.FAILED]: 'var(--error)',
  [ApplicationStatus.CANCELLED]: 'var(--muted)',
  [ApplicationStatus.EMAIL_SENT]: 'var(--green)',
  [ApplicationStatus.EMAIL_OPENED]: 'var(--green)',
  [ApplicationStatus.EMAIL_FAILED]: 'var(--error)',
};
