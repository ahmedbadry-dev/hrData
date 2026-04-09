import { z } from 'zod';

export const VerifyEmailDtoSchema = z.object({
  token: z.string().min(1),
});

export type VerifyEmailDto = z.infer<typeof VerifyEmailDtoSchema>;
