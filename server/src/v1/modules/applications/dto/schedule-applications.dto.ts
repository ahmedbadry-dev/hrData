import { z } from 'zod';
import { APPLICATIONS_CONSTANTS } from '../applications.constants';

export const ScheduleApplicationsDtoSchema = z.object({
  body: z.object({
    jobIds: z
      .array(z.string().uuid())
      .min(1, APPLICATIONS_CONSTANTS.MESSAGES.NO_SAVED_JOBS_PROVIDED),
    sendTime: z
      .string()
      .refine(
        (val) =>
          val === 'immediately' ||
          val === 'now' ||
          /^\d{1,2}(am|pm)$/.test(val) ||
          val === 'tomorrow8am' ||
          val.startsWith('test') ||
          !isNaN(Date.parse(val)),
        APPLICATIONS_CONSTANTS.MESSAGES.INVALID_SEND_TIME
      ),
    delayBetweenEmails: z
      .number()
      .min(0)
      .default(APPLICATIONS_CONSTANTS.DEFAULT_DELAY_BETWEEN_EMAILS_MS)
      .optional(),
    cvId: z.string().uuid().optional(),
  }),
});

export type ScheduleApplicationsDto = z.infer<typeof ScheduleApplicationsDtoSchema>;
