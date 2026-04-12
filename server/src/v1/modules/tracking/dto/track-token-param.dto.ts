import { z } from 'zod';

export const TrackTokenParamDtoSchema = z.object({
  params: z.object({
    token: z.string().uuid('Invalid tracking token'),
  }),
});

export type TrackTokenParamDto = z.infer<typeof TrackTokenParamDtoSchema>;
