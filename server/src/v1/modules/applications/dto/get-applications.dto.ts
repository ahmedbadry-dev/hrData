import { z } from 'zod';
import { APPLICATIONS_CONSTANTS } from '../applications.constants';

export const ApplicationStatusGroupSchema = z.enum([
  'all',
  'pending',
  'sent',
  'failed',
  'cancelled',
]);

export const GetApplicationsDtoSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .min(APPLICATIONS_CONSTANTS.PAGINATION.MIN_PAGE)
      .default(APPLICATIONS_CONSTANTS.PAGINATION.DEFAULT_PAGE)
      .optional(),
    limit: z.coerce
      .number()
      .min(APPLICATIONS_CONSTANTS.PAGINATION.MIN_LIMIT)
      .max(APPLICATIONS_CONSTANTS.PAGINATION.MAX_LIMIT)
      .default(APPLICATIONS_CONSTANTS.PAGINATION.DEFAULT_LIMIT)
      .optional(),
    status: z.string().optional(),
    statusGroup: ApplicationStatusGroupSchema.optional(),
  }),
});

export type GetApplicationsDto = z.infer<typeof GetApplicationsDtoSchema>;
