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
  description?: string | null;
  experience?: string | null;
  qualification?: string | null;
  specialization?: string | null;
  jobId?: string;
  isSaved?: boolean;
}
