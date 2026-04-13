export const APPLICATIONS_CONSTANTS = {
  PAGINATION: {
    MIN_PAGE: 1,
    DEFAULT_PAGE: 1,
    MIN_LIMIT: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  ORDER_BY: {
    CREATED_AT_DESC: { createdAt: 'desc' },
    STATUS_PENDING_FIRST: [{ status: 'asc' }, { createdAt: 'desc' }] as any,
  },
  DEFAULT_DELAY_BETWEEN_EMAILS_MS: 30000,
  MESSAGES: {
    APPLICATIONS_FETCHED_SUCCESSFULLY: 'Applications fetched successfully',
    APPLICATION_FETCHED_SUCCESSFULLY: 'Application fetched successfully',
    APPLICATION_SCHEDULED_SUCCESSFULLY: 'Application email scheduled successfully',
    APPLICATION_CANCELLED_SUCCESSFULLY: 'Application cancelled successfully',
    APPLICATION_NOT_FOUND: 'Application not found',
    NO_SAVED_JOBS_PROVIDED: 'No saved jobs provided',
    NO_DEFAULT_CV: 'No CV file provided. Please attach a CV.',
    NO_VALID_HR_EMAILS: 'No valid HR email addresses found for selected jobs.',
    JOB_NOT_SAVED: 'One or more jobs are not saved by the user',
    INVALID_SEND_TIME: 'Invalid send time. Use "immediately" or an ISO date string.',
  },
} as const;
