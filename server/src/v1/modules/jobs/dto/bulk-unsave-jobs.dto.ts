import { z } from 'zod';

export const BulkUnsaveJobsDtoSchema = z.object({
  body: z.object({
    jobIds: z.array(z.string().uuid('Invalid job ID')).min(1, 'At least one job ID is required'),
  }),
});

export type BulkUnsaveJobsDto = z.infer<typeof BulkUnsaveJobsDtoSchema>;
