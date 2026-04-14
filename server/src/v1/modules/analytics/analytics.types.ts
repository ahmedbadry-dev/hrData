export interface DailyDataPoint {
  date: string;
  count: number;
}

export interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalJobs: number;
  newJobsToday: number;
  totalApplicationsSent: number;
  applicationsThisWeek: number;
  emailOpenedPercentage: number;
}

export interface UserActivityDataPoint {
  date: string;
  activeUsers: number;
  newSessions: number;
}

export interface TopJobDataPoint {
  jobId: string;
  title: string;
  companyName: string;
  applicationCount: number;
}

export interface ApplicationStatusDistribution {
  success: number;
  failed: number;
  pending: number;
}

export interface AdvancedOverviewStats {
  activeUsers: number;
  autoSuccessRate: number;
  emailOpenRate: number;
  totalApplications: number;
}

export interface RecentActivityLog {
  id: string;
  action: string;
  entityType: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string } | null;
}
