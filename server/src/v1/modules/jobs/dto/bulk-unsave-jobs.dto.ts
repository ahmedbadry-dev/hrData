import { z } from 'zod';

export const BulkUnsaveJobsDtoSchema = z.object({
  body: z.object({
    jobIds: z.array(z.string().uuid('Invalid job ID')).optional(),
  }),
});

export type BulkUnsaveJobsDto = z.infer<typeof BulkUnsaveJobsDtoSchema>;
