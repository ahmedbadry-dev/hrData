import { ApplicationStatus } from 'generated/prisma';
import db from '@/config/db.config';
import { DailyDataPoint, OverviewStats } from './analytics.types';

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
}
