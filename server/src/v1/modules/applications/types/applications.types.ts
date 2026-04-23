import { ApplicationStatus } from '@prisma/client';

export interface EmailQuotaResponse {
  emailsUsedToday: number;
  dailyEmailLimit: number;
  remaining: number;
  resetsAt: Date | null;
}

export interface ApplicationResponse {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  openedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
  job: {
    id: string;
    title: string;
    companyName: string;
    hrEmail: string | null;
  };
}

export interface PaginatedApplicationsResponse {
  applications: ApplicationResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface GetApplicationsResponse extends PaginatedApplicationsResponse, EmailQuotaResponse {}

export interface GetApplicationByIdResponse extends ApplicationResponse, EmailQuotaResponse {}

export interface ScheduleApplicationResponse extends EmailQuotaResponse {
  requestedCount: number;
  scheduledCount: number;
  skippedCount: number;
  cappedByLimit: boolean;
  applicationIds: string[];
}
