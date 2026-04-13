export interface DailyDataPoint {
  date: string;
  count: number;
}

export interface OverviewStats {
  totalUsers: number;
  newUsersToday: number;
  totalJobs: number;
  newJobsToday: number;
  totalApplicationsSent: number;
  applicationsThisWeek: number;
  emailOpenedPercentage: number;
}
