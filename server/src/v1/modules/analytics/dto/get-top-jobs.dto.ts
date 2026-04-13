import { z } from 'zod';

export const GetTopJobsDtoSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(20).default(5),
  }),
});

export type GetTopJobsDto = z.infer<typeof GetTopJobsDtoSchema>;
