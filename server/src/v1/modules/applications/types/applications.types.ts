import { ApplicationStatus, Job } from 'generated/prisma';

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

export interface ScheduleApplicationResponse {
  scheduledCount: number;
  applicationIds: string[];
}
