import { z } from 'zod';
import { APPLICATIONS_CONSTANTS } from '../applications.constants';

const jobIdsPreprocess = (val: unknown) => {
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val;
    }
  }
  return val;
};

const jobIdsSchema = z.preprocess(
  jobIdsPreprocess,
  z.array(z.string().uuid()).min(1, APPLICATIONS_CONSTANTS.MESSAGES.NO_SAVED_JOBS_PROVIDED)
);

const cvObjectSchema = z
  .object({
    name: z.string().optional(),
    type: z.string().optional(),
    size: z.number().optional(),
    data: z.string(),
  })
  .passthrough();

const sendTimeRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}|\d{4}-\d{2}-\d{2})$/;
export const ScheduleApplicationsDtoSchema = z.object({
  body: z.object({
    jobIds: jobIdsSchema,
    sendTime: z
      .string()
      .refine(
        (val) =>
          val === 'immediately' ||
          sendTimeRegex.test(val) ||
          !isNaN(Date.parse(val)),
        APPLICATIONS_CONSTANTS.MESSAGES.INVALID_SEND_TIME
      ),
    delayBetweenEmails: z.coerce
      .number()
      .min(0)
      .default(APPLICATIONS_CONSTANTS.DEFAULT_DELAY_BETWEEN_EMAILS_MS)
      .optional(),
    cv: cvObjectSchema.optional(),
  }),
});

export type ScheduleApplicationsDto = z.infer<typeof ScheduleApplicationsDtoSchema>;
