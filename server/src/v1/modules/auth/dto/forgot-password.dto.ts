import { z } from 'zod';

export const ForgotPasswordDtoSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;
