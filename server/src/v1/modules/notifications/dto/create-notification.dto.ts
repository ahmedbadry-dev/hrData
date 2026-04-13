import { NotificationTarget, NotificationType } from 'generated/prisma';
import { z } from 'zod';

export const CreateNotificationDtoSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100).trim(),
    body: z.string().min(5).max(1000).trim(),
    type: z.nativeEnum(NotificationType),
    target: z.nativeEnum(NotificationTarget),
  }),
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationDtoSchema>;
