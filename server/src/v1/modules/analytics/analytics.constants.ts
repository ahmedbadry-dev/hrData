export const ANALYTICS_ROUTES = {
  GET_OVERVIEW: '/overview',
  GET_LOGINS_PER_DAY: '/logins-per-day',
  GET_APPLICATIONS_PER_DAY: '/applications-per-day',
  GET_EMAIL_ERRORS_PER_DAY: '/email-errors-per-day',
} as const;

export const ANALYTICS_MESSAGES = {
  OVERVIEW_FETCHED_SUCCESSFULLY: 'Overview stats fetched successfully',
  LOGINS_PER_DAY_FETCHED_SUCCESSFULLY: 'Logins per day fetched successfully',
  APPLICATIONS_PER_DAY_FETCHED_SUCCESSFULLY: 'Applications per day fetched successfully',
  EMAIL_ERRORS_PER_DAY_FETCHED_SUCCESSFULLY: 'Email errors per day fetched successfully',
} as const;
