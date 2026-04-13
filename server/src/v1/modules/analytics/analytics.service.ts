import { ApplicationStatus } from 'generated/prisma';
import db from '@/config/db.config';
import {
  AdvancedOverviewStats,
  ApplicationStatusDistribution,
  DailyDataPoint,
  OverviewStats,
  TopJobDataPoint,
  UserActivityDataPoint,
} from './analytics.types';

export class AnalyticsService {
  constructor(private readonly prisma = db) {}

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
    const groupedApplications = await this.prisma.application.groupBy({
      by: ['jobId'],
      where: {
        status: {
          in: [
            ApplicationStatus.SENT,
            ApplicationStatus.EMAIL_SENT,
            ApplicationStatus.EMAIL_OPENED,
          ],
        },
      },
      _count: {
        jobId: true,
      },
      orderBy: {
        _count: {
          jobId: 'desc',
        },
      },
      take: limit,
    });

    if (groupedApplications.length === 0) {
      return [];
    }

    const jobIds = groupedApplications.map((application) => application.jobId);

    const jobs = await this.prisma.job.findMany({
      where: {
        id: {
          in: jobIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const jobsMap = new Map(jobs.map((job) => [job.id, job.title]));

    return groupedApplications
      .map((application) => ({
        title: jobsMap.get(application.jobId) || 'Unknown',
        count: application._count.jobId,
      }))
      .sort((a, b) => b.count - a.count);
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
          status: ApplicationStatus.FAILED,
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
