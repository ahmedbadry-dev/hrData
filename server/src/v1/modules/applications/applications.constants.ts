export const APPLICATIONS_CONSTANTS = {
  PAGINATION: {
    MIN_PAGE: 1,
    DEFAULT_PAGE: 1,
    MIN_LIMIT: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  ORDER_BY: {
    CREATED_AT_DESC: { createdAt: 'desc' as const },
    STATUS_PENDING_FIRST: [{ status: 'asc' as const }, { createdAt: 'desc' as const }] as [
      { status: 'asc' },
      { createdAt: 'desc' },
    ],
  },
  DEFAULT_DELAY_BETWEEN_EMAILS_MS: 30000,
  DEFAULT_DAILY_EMAIL_LIMIT: 20,
  DAILY_EMAIL_LIMIT_MIN: 0,
  DAILY_EMAIL_LIMIT_RESET_WINDOW_MS: 24 * 60 * 60 * 1000,
  MESSAGES: {
    APPLICATIONS_FETCHED_SUCCESSFULLY: 'Applications fetched successfully',
    APPLICATION_FETCHED_SUCCESSFULLY: 'Application fetched successfully',
    APPLICATION_SCHEDULED_SUCCESSFULLY: 'Application email scheduled successfully',
    EMAIL_QUOTA_FETCHED_SUCCESSFULLY: 'Email quota fetched successfully',
    APPLICATION_CANCELLED_SUCCESSFULLY: 'Application cancelled successfully',
    APPLICATION_NOT_FOUND: 'Application not found',
    NO_SAVED_JOBS_PROVIDED: 'No saved jobs provided',
    NO_DEFAULT_CV: 'No CV file provided. Please attach a CV.',
    NO_VALID_HR_EMAILS: 'No valid HR email addresses found for selected jobs.',
    JOB_NOT_SAVED: 'One or more jobs are not saved by the user',
    INVALID_SEND_TIME: 'Invalid send time. Use "immediately" or an ISO date string.',
    DAILY_EMAIL_LIMIT_REACHED: 'لقد وصلت إلى الحد اليومي لإرسال الإيميلات. يمكنك الإرسال مجدداً في',
  },
} as const;
