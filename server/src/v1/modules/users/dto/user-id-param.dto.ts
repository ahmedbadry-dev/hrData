import { z } from 'zod';
import { USERS_CONSTANTS } from '../users.constants';

export const UserIdParamDtoSchema = z.object({
  params: z.object({
    id: z.string().uuid(USERS_CONSTANTS.MESSAGES.INVALID_USER_ID),
  }),
});

export type UserIdParamDto = z.infer<typeof UserIdParamDtoSchema>;
