import { z } from 'zod';

export const GmailCallbackDtoSchema = z.object({
  query: z.object({
    code: z.string().min(1, 'Authorization code is required'),
    state: z.string().min(1, 'OAuth state is required'),
  }),
});

export type GmailCallbackDto = z.infer<typeof GmailCallbackDtoSchema>;
