import type { Job, PaginatedJobs, GetJobsParams } from '../api/jobs.service';

export type { Job, PaginatedJobs, GetJobsParams };

export interface UserJob {
  company: string;
  role: string;
  major: string;
  city: string;
  date: string;
  email: string;
  hrEmail?: string;
  jobId?: string;
  isSaved?: boolean;
}
