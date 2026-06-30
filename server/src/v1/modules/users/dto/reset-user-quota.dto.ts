import { z } from 'zod';

export const ResetUserQuotaDtoSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(3).max(500),
  }),
});

export type ResetUserQuotaDto = z.infer<typeof ResetUserQuotaDtoSchema>;
