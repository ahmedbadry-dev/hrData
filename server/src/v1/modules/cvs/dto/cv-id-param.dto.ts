import { z } from 'zod';

export const CvIdParamDtoSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid CV ID'),
  }),
});

export type CvIdParamDto = z.infer<typeof CvIdParamDtoSchema>;
