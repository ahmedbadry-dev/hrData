import { z } from 'zod';

export const CreateUserDtoSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1).startsWith('0'),
    password: z.string().min(8),
  }),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
