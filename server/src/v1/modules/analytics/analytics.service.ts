import { ApplicationStatus, PrismaClient, UserStatus } from 'generated/prisma';
import {
  AdvancedOverviewStats,
  ApplicationStatusDistribution,
  DailyDataPoint,
  OverviewStats,
  RecentActivityLog,
  TopJobDataPoint,
  UserActivityDataPoint,
} from './analytics.types';

export class AnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  private getStartOfDay(daysAgo: number): Date {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - daysAgo);
    return date;
  }

  private buildDateSeries(days: number): string[] {
    const dateSeries: string[] = [];

    for (let daysAgo = days - 1; daysAgo >= 0; daysAgo--) {
      dateSeries.push(this.getStartOfDay(daysAgo).toISOString().split('T')[0]);
    }

    return dateSeries;
  }

  async getOverviewStats(): Promise<OverviewStats> {
    const applicationSentStatuses: ApplicationStatus[] = [
      ApplicationStatus.SENT,
      ApplicationStatus.EMAIL_SENT,
      ApplicationStatus.EMAIL_OPENED,
    ];

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      totalJobs,
      newJobsToday,
      totalApplicationsSent,
      applicationsThisWeek,
      emailOpenedCount,
      emailSentCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: this.getStartOfDay(0),
          },
        },
      }),
      this.prisma.job.count(),
      this.prisma.job.count({
        where: {
          createdAt: {
            gte: this.getStartOfDay(0),
          },
        },
      }),
      this.prisma.application.count({
        where: {
          status: {
            in: applicationSentStatuses,
          },
        },
      }),
      this.prisma.application.count({
        where: {
          status: {
            in: applicationSentStatuses,
          },
          createdAt: {
            gte: this.getStartOfDay(6),
          },
        },
      }),
      this.prisma.application.count({
        where: {
          status: ApplicationStatus.EMAIL_OPENED,
        },
      }),
      this.prisma.application.count({
        where: {
          status: {
            in: [ApplicationStatus.EMAIL_SENT, ApplicationStatus.EMAIL_OPENED],
          },
        },
      }),
    ]);

    const emailOpenedPercentage =
      emailSentCount > 0 ? parseFloat(((emailOpenedCount / emailSentCount) * 100).toFixed(2)) : 0;

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      totalJobs,
      newJobsToday,
      totalApplicationsSent,
      applicationsThisWeek,
      emailOpenedPercentage,
    };
  }

  async getAdvancedOverview(): Promise<AdvancedOverviewStats> {
    const successfulStatuses: ApplicationStatus[] = [
      ApplicationStatus.SENT,
      ApplicationStatus.EMAIL_SENT,
      ApplicationStatus.EMAIL_OPENED,
    ];
    const pendingStatuses: ApplicationStatus[] = [
      ApplicationStatus.SCHEDULED,
      ApplicationStatus.SENDING,
    ];

    const [
      activeUsers,
      totalApplications,
      successfulApplications,
      nonPendingApplications,
      emailOpenedCount,
      emailSentCount,
    ] = await Promise.all([
      this.prisma.session.findMany({
        where: {
          createdAt: {
            gte: this.getStartOfDay(29),
          },
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      }),
      this.prisma.application.count(),
      this.prisma.application.count({
        where: {
          status: {
            in: successfulStatuses,
          },
        },
      }),
      this.prisma.application.count({
        where: {
          status: {
            notIn: pendingStatuses,
          },
        },
      }),
      this.prisma.application.count({
        where: {
          status: ApplicationStatus.EMAIL_OPENED,
        },
      }),
      this.prisma.application.count({
        where: {
          status: {
            in: [ApplicationStatus.EMAIL_SENT, ApplicationStatus.EMAIL_OPENED],
          },
        },
      }),
    ]);

    const autoSuccessRate =
      nonPendingApplications > 0
        ? parseFloat(((successfulApplications / nonPendingApplications) * 100).toFixed(2))
        : 0;

    const emailOpenRate =
      emailSentCount > 0 ? parseFloat(((emailOpenedCount / emailSentCount) * 100).toFixed(2)) : 0;

    return {
      activeUsers: activeUsers.length,
      autoSuccessRate,
      emailOpenRate,
      totalApplications,
    };
  }

  async getLoginsPerDay(days: number): Promise<DailyDataPoint[]> {
    const dateSeries = this.buildDateSeries(days);

    const sessions = await this.prisma.session.findMany({
      where: {
        createdAt: {
          gte: this.getStartOfDay(days - 1),
        },
      },
      select: {
        createdAt: true,
      },
    });

    const groupedData = sessions.reduce<Record<string, number>>((accumulator, session) => {
      const date = session.createdAt.toISOString().split('T')[0];
      accumulator[date] = (accumulator[date] || 0) + 1;
      return accumulator;
    }, {});

    return dateSeries.map((date) => ({
      date,
      count: groupedData[date] || 0,
    }));
  }

  async getApplicationsPerDay(days: number): Promise<DailyDataPoint[]> {
    const dateSeries = this.buildDateSeries(days);

    const applications = await this.prisma.application.findMany({
      where: {
        createdAt: {
          gte: this.getStartOfDay(days - 1),
        },
        status: {
          in: [
            ApplicationStatus.SENT,
            ApplicationStatus.EMAIL_SENT,
            ApplicationStatus.EMAIL_OPENED,
          ],
        },
      },
      select: {
        createdAt: true,
      },
    });

    const groupedData = applications.reduce<Record<string, number>>((accumulator, application) => {
      const date = application.createdAt.toISOString().split('T')[0];
      accumulator[date] = (accumulator[date] || 0) + 1;
      return accumulator;
    }, {});

    return dateSeries.map((date) => ({
      date,
      count: groupedData[date] || 0,
    }));
  }

  async getEmailErrorsPerDay(days: number): Promise<DailyDataPoint[]> {
    const dateSeries = this.buildDateSeries(days);

    const failedApplications = await this.prisma.application.findMany({
      where: {
        status: ApplicationStatus.FAILED,
        updatedAt: {
          gte: this.getStartOfDay(days - 1),
        },
      },
      select: {
        updatedAt: true,
      },
    });

    const groupedData = failedApplications.reduce<Record<string, number>>(
      (accumulator, application) => {
        const date = application.updatedAt.toISOString().split('T')[0];
        accumulator[date] = (accumulator[date] || 0) + 1;
        return accumulator;
      },
      {}
    );

    return dateSeries.map((date) => ({
      date,
      count: groupedData[date] || 0,
    }));
  }

  async getUserActivityPerDay(days: number): Promise<UserActivityDataPoint[]> {
    const dateSeries = this.buildDateSeries(days);

    const sessions = await this.prisma.session.findMany({
      where: {
        createdAt: {
          gte: this.getStartOfDay(days - 1),
        },
      },
      select: {
        createdAt: true,
        userId: true,
      },
    });

    const groupedData = sessions.reduce<
      Record<
        string,
        {
          newSessions: number;
          activeUserIds: Set<string>;
        }
      >
    >((accumulator, session) => {
      const date = session.createdAt.toISOString().split('T')[0];

      if (!accumulator[date]) {
        accumulator[date] = {
          newSessions: 0,
          activeUserIds: new Set<string>(),
        };
      }

      accumulator[date].newSessions += 1;
      accumulator[date].activeUserIds.add(session.userId);

      return accumulator;
    }, {});

    return dateSeries.map((date) => ({
      date,
      activeUsers: groupedData[date]?.activeUserIds.size || 0,
      newSessions: groupedData[date]?.newSessions || 0,
    }));
  }

  async getTopAppliedJobs(limit: number): Promise<TopJobDataPoint[]> {
    const topJobs = await this.prisma.application.groupBy({
      by: ['jobId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    if (topJobs.length === 0) {
      return [];
    }

    const jobIds = topJobs.map((job) => job.jobId);

    const jobs = await this.prisma.job.findMany({
      where: {
        id: {
          in: jobIds,
        },
      },
      select: {
        id: true,
        title: true,
        companyName: true,
      },
    });

    return topJobs.map((entry) => {
      const job = jobs.find((item) => item.id === entry.jobId);

      return {
        jobId: entry.jobId,
        title: job?.title ?? 'Unknown',
        companyName: job?.companyName ?? '',
        applicationCount: entry._count.id,
      };
    });
  }

  async getRecentActivityLogs(): Promise<RecentActivityLog[]> {
    const logs = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        action: true,
        entityType: true,
        metadata: true,
        ipAddress: true,
        createdAt: true,
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return logs.map((log) => ({
      ...log,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    }));
  }

  async getApplicationStatusDistribution(): Promise<ApplicationStatusDistribution> {
    const [success, failed, pending] = await Promise.all([
      this.prisma.application.count({
        where: {
          status: {
            in: [
              ApplicationStatus.SENT,
              ApplicationStatus.EMAIL_SENT,
              ApplicationStatus.EMAIL_OPENED,
            ],
          },
        },
      }),
      this.prisma.application.count({
        where: {
          status: {
            in: [ApplicationStatus.FAILED, ApplicationStatus.EMAIL_FAILED],
          },
        },
      }),
      this.prisma.application.count({
        where: {
          status: {
            in: [ApplicationStatus.SCHEDULED, ApplicationStatus.SENDING],
          },
        },
      }),
    ]);

    return {
      success,
      failed,
      pending,
    };
  }
}
