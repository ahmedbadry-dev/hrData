import { z } from 'zod';

export const GetDailyStatsDtoSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(90).default(7),
  }),
});

export type GetDailyStatsDto = z.infer<typeof GetDailyStatsDtoSchema>;
