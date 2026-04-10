import { z } from 'zod';

export const UpdateUserDtoSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    phone: z.string().regex(/^[0-9+\-\s()]+$/).optional().nullable(),
  }),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;
