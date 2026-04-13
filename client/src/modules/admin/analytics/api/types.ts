export interface OverviewStats {
  totalUsers: number;
  newUsersToday: number;
  totalJobs: number;
  newJobsToday: number;
  totalApplicationsSent: number;
  applicationsThisWeek: number;
  emailOpenedPercentage: number;
}

export interface AdvancedOverviewStats {
  activeUsers: number;
  autoSuccessRate: number;
  emailOpenRate: number;
  totalApplications: number;
}

export interface DailyDataPoint {
  date: string;
  count: number;
}

export interface UserActivityDataPoint {
  date: string;
  activeUsers: number;
  newSessions: number;
}

export interface TopJobDataPoint {
  title: string;
  count: number;
}

export interface ApplicationStatusDistribution {
  success: number;
  failed: number;
  pending: number;
}
