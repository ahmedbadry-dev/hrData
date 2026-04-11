import { z } from 'zod';

export const ApplicationIdParamDtoSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type ApplicationIdParamDto = z.infer<typeof ApplicationIdParamDtoSchema>;
