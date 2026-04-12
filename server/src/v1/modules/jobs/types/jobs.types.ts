import { JobLocation } from 'generated/prisma';
import { PaginationMeta } from '@/shared/utils/api-response';

export interface JobResponse {
  id: string;
  title: string;
  companyName: string;
  location: JobLocation | null;
  category: string | null;
  description: string | null;
  source: string;
  sourceUrl: string | null;
  language: string;
  postedAt: Date | null;
  expiresAt: Date | null;
  isExpired: boolean;
  isSaved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedJobsResponse {
  jobs: JobResponse[];
  pagination: PaginationMeta;
}

export interface SaveJobResponse {
  jobId: string;
  savedAt: Date;
}

export interface BulkSaveJobsResponse {
  savedJobIds: string[];
  alreadySavedJobIds: string[];
}

export interface BulkUnsaveJobsResponse {
  removedJobIds: string[];
  notSavedJobIds: string[];
}

export interface BulkCreateJobsResponse {
  createdJobs: JobResponse[];
  failedJobs: Array<{
    index: number;
    title: string;
    companyName: string;
    reason: string;
  }>;
  summary: {
    total: number;
    created: number;
    failed: number;
  };
}
