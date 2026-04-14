import { z } from 'zod';

export const ValidateResetTokenDtoSchema = z.object({
  query: z.object({
    token: z.string('Token is required').min(1, 'Token is required'),
  }),
});

export type ValidateResetTokenDto = z.infer<typeof ValidateResetTokenDtoSchema>;
