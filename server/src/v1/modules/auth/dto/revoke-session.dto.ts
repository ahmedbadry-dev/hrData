import { z } from 'zod';

export const RevokeSessionDtoSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});

export type RevokeSessionDto = z.infer<typeof RevokeSessionDtoSchema>;
