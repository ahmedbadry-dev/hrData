import { APP_CONSTANTS } from '@/config/constants';

export const buildSkipTake = (page?: number, limit?: number): { skip: number; take: number } => {
  const p = page ?? APP_CONSTANTS.PAGINATION_DEFAULT_PAGE;
  const l = Math.min(
    limit ?? APP_CONSTANTS.PAGINATION_DEFAULT_LIMIT,
    APP_CONSTANTS.PAGINATION_MAX_LIMIT
  );
  return { skip: (p - 1) * l, take: l };
};

export const buildMeta = (
  total: number,
  page: number,
  limit: number
): { page: number; limit: number; total: number; totalPages: number } => {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
};
