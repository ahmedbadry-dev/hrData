const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export type ApplicationsListParams = {
  page?: number;
  limit?: number;
  status?: string;
};

const normalizeStatus = (value?: string): string => value?.trim() ?? '';

const normalizeListParams = (params?: ApplicationsListParams) => ({
  page: params?.page ?? DEFAULT_PAGE,
  limit: params?.limit ?? DEFAULT_LIMIT,
  status: normalizeStatus(params?.status),
});

export const applicationsQueryKeys = {
  all: ['applications'] as const,
  list: (params?: ApplicationsListParams) =>
    ['applications', normalizeListParams(params)] as const,
  weeklyActivity: ['applications', 'weekly-activity'] as const,
};
