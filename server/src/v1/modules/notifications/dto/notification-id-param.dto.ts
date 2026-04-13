import { z } from 'zod';

export const NotificationIdParamDtoSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type NotificationIdParamDto = z.infer<typeof NotificationIdParamDtoSchema>;
