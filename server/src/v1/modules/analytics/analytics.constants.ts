export const ANALYTICS_ROUTES = {
  GET_OVERVIEW: '/overview',
  GET_ADVANCED_OVERVIEW: '/advanced-overview',
  GET_LOGINS_PER_DAY: '/logins-per-day',
  GET_APPLICATIONS_PER_DAY: '/applications-per-day',
  GET_EMAIL_ERRORS_PER_DAY: '/email-errors-per-day',
  GET_USER_ACTIVITY_PER_DAY: '/user-activity-per-day',
  GET_TOP_JOBS: '/top-jobs',
  GET_APPLICATION_STATUS_DISTRIBUTION: '/application-status-distribution',
} as const;

export const ANALYTICS_MESSAGES = {
  OVERVIEW_FETCHED_SUCCESSFULLY: 'Overview stats fetched successfully',
  ADVANCED_OVERVIEW_FETCHED_SUCCESSFULLY: 'Advanced overview stats fetched successfully',
  LOGINS_PER_DAY_FETCHED_SUCCESSFULLY: 'Logins per day fetched successfully',
  APPLICATIONS_PER_DAY_FETCHED_SUCCESSFULLY: 'Applications per day fetched successfully',
  EMAIL_ERRORS_PER_DAY_FETCHED_SUCCESSFULLY: 'Email errors per day fetched successfully',
  USER_ACTIVITY_PER_DAY_FETCHED_SUCCESSFULLY: 'User activity per day fetched successfully',
  TOP_APPLIED_JOBS_FETCHED_SUCCESSFULLY: 'Top applied jobs fetched successfully',
  APPLICATION_STATUS_DISTRIBUTION_FETCHED_SUCCESSFULLY:
    'Application status distribution fetched successfully',
} as const;
