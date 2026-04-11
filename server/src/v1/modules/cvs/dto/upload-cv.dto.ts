import { z } from 'zod';

export const UploadCvDtoSchema = z.object({
  body: z.object({
    isDefault: z.boolean().optional().default(false),
  }),
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number(),
    destination: z.string(),
    filename: z.string(),
    path: z.string(),
  }),
});

export type UploadCvDto = z.infer<typeof UploadCvDtoSchema>;
