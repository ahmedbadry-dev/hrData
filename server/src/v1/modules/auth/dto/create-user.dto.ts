import { z } from 'zod';

export const CreateUserDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
