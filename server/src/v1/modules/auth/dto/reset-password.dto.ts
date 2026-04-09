import { z } from 'zod';

export const ResetPasswordDtoSchema = z.object({
  query: z.object({
    token: z.string('Token is required').min(1, 'Token is required'),
  }),
  body: z
    .object({
      password: z
        .string('Password is required')
        .min(8, 'Password must be at least 8 characters long'),
      confirmPassword: z.string('Confirm password is required'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;
