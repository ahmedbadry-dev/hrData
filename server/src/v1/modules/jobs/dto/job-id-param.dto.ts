import { z } from 'zod';
import { JOBS_CONSTANTS } from '../jobs.constants';

export const JobIdParamDtoSchema = z.object({
  params: z.object({
    id: z.string().uuid(JOBS_CONSTANTS.MESSAGES.INVALID_JOB_ID),
  }),
});

export type JobIdParamDto = z.infer<typeof JobIdParamDtoSchema>;
