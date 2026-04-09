import { z } from 'zod';

export const ChangePasswordDtoSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string('Current password is required')
        .min(1, 'Current password is required'),
      newPassword: z
        .string('New password is required')
        .min(8, 'New password must be at least 8 characters long'),
      confirmNewPassword: z.string('Confirm password is required'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: 'Passwords do not match',
      path: ['confirmNewPassword'],
    }),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;
