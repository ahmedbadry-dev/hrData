import { UserStatus } from '@generated/prisma';
import { z } from 'zod';
import { USERS_CONSTANTS } from '../users.constants';

export const GetUsersDtoSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .min(USERS_CONSTANTS.PAGINATION.MIN_PAGE)
      .default(USERS_CONSTANTS.PAGINATION.DEFAULT_PAGE)
      .optional(),
    limit: z.coerce
      .number()
      .min(USERS_CONSTANTS.PAGINATION.MIN_LIMIT)
      .max(USERS_CONSTANTS.PAGINATION.MAX_LIMIT)
      .default(USERS_CONSTANTS.PAGINATION.DEFAULT_LIMIT)
      .optional(),
    keyword: z.string().trim().optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export type GetUsersDto = z.infer<typeof GetUsersDtoSchema>;
