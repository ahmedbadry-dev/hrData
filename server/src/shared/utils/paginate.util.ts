import { APP_CONSTANTS } from '@/config/constants';
import { PaginationMeta } from './api-response';

interface PaginationQuery {
  page?: number | undefined;
  limit?: number | undefined;
}

interface PaginationDefaults {
  minPage?: number;
  defaultPage?: number;
  minLimit?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

const toSafeNumber = (value: number | undefined, fallback: number): number => {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  return Number(value);
};

export const resolvePagination = (
  query: PaginationQuery,
  defaults: PaginationDefaults = {}
): PaginationParams => {
  const minPage = defaults.minPage ?? APP_CONSTANTS.PAGINATION_DEFAULT_PAGE;
  const minLimit = defaults.minLimit ?? 1;
  const maxLimit = defaults.maxLimit ?? APP_CONSTANTS.PAGINATION_MAX_LIMIT;

  const page = Math.max(
    minPage,
    toSafeNumber(query.page, defaults.defaultPage ?? APP_CONSTANTS.PAGINATION_DEFAULT_PAGE)
  );

  const rawLimit = toSafeNumber(
    query.limit,
    defaults.defaultLimit ?? APP_CONSTANTS.PAGINATION_DEFAULT_LIMIT
  );
  const limit = Math.min(maxLimit, Math.max(minLimit, rawLimit));

  return {
    page,
    limit,
    skip: (page - minPage) * limit,
  };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
  minPage: number = APP_CONSTANTS.PAGINATION_DEFAULT_PAGE
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > minPage,
  };
};
