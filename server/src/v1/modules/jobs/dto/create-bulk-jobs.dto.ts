import { JobLocation } from '@prisma/client';
import { z } from 'zod';
import { JOBS_CONSTANTS } from '../jobs.constants';

export const CreateBulkJobsDtoSchema = z.object({
  body: z.object({
    jobs: z
      .array(
        z.object({
          title: z.string().min(1, 'Title is required').trim(),
          companyName: z.string().min(1, 'Company name is required').trim(),
          source: z.string().min(1, 'Source is required').trim(),
          location: z.nativeEnum(JobLocation).optional(),
          category: z.string().trim().optional(),
          description: z.string().trim().optional(),
          hrEmail: z.string().email('Invalid email').optional().or(z.literal('')),
          sourceUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
          language: z.string().default('ar').optional(),
          postedAt: z.string().datetime().optional(),
          expiresAt: z.string().datetime().optional(),
        })
      )
      .min(1, 'At least one job is required')
      .max(100, 'Maximum 100 jobs per request'),
  }),
});

export type CreateBulkJobsDto = z.infer<typeof CreateBulkJobsDtoSchema>;
