import { JobLocation } from 'generated/prisma';
import { z } from 'zod';
import { JOBS_CONSTANTS } from '../jobs.constants';

export const GetJobsDtoSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .min(JOBS_CONSTANTS.PAGINATION.MIN_PAGE)
      .default(JOBS_CONSTANTS.PAGINATION.DEFAULT_PAGE)
      .optional(),
    limit: z.coerce
      .number()
      .min(JOBS_CONSTANTS.PAGINATION.MIN_LIMIT)
      .max(JOBS_CONSTANTS.PAGINATION.MAX_LIMIT)
      .default(JOBS_CONSTANTS.PAGINATION.DEFAULT_LIMIT)
      .optional(),
    keyword: z.string().trim().optional(),
    location: z.nativeEnum(JobLocation).optional(),
  }),
});

export type GetJobsDto = z.infer<typeof GetJobsDtoSchema>;
