import { z } from 'zod';

export const ResetPasswordDtoSchema = z.object({
  body: z.object({
    password: z.string().min(8),
  }),
  query: z.object({
    token: z.string().min(1),
  }),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;
