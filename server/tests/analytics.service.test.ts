import assert from 'node:assert/strict';
import test from 'node:test';

import { ApplicationStatus } from 'generated/prisma';
import { AnalyticsService } from '../src/v1/modules/analytics/analytics.service';

type CountCall = { where?: unknown };
type FindManyCall = { where?: unknown; select?: unknown };

const getStartOfUtcDay = (daysAgo: number): Date => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
};

const toDateKey = (date: Date): string => date.toISOString().split('T')[0];

test('analytics service overview returns aggregated counts with percentage', async () => {
  const userCountCalls: CountCall[] = [];
  const jobCountCalls: CountCall[] = [];
  const applicationCountCalls: CountCall[] = [];

  const prismaMock = {
    user: {
      count: async (args?: CountCall) => {
        userCountCalls.push(args || {});
        return userCountCalls.length === 1 ? 100 : 7;
      },
    },
    job: {
      count: async (args?: CountCall) => {
        jobCountCalls.push(args || {});
        return jobCountCalls.length === 1 ? 240 : 12;
      },
    },
    application: {
      _callCount: 0,
      count: async (args?: CountCall) => {
        applicationCountCalls.push(args || {});
        prismaMock.application._callCount += 1;

        if (prismaMock.application._callCount === 1) return 80;
        if (prismaMock.application._callCount === 2) return 20;
        if (prismaMock.application._callCount === 3) return 18;
        if (prismaMock.application._callCount === 4) return 24;
        return 0;
      },
      findMany: async () => [],
    },
    session: {
      findMany: async () => [],
    },
  };

  const service = new AnalyticsService(prismaMock as never);
  const result = await service.getOverviewStats();

  assert.equal(result.totalUsers, 100);
  assert.equal(result.newUsersToday, 7);
  assert.equal(result.totalJobs, 240);
  assert.equal(result.newJobsToday, 12);
  assert.equal(result.totalApplicationsSent, 80);
  assert.equal(result.applicationsThisWeek, 20);
  assert.equal(result.emailOpenedPercentage, 75);

  assert.equal(userCountCalls.length, 2);
  assert.equal(jobCountCalls.length, 2);
  assert.equal(applicationCountCalls.length, 4);

  const newUsersWhere = userCountCalls[1].where as { createdAt: { gte: Date } };
  assert.ok(newUsersWhere.createdAt.gte instanceof Date);

  const newJobsWhere = jobCountCalls[1].where as { createdAt: { gte: Date } };
  assert.ok(newJobsWhere.createdAt.gte instanceof Date);

  const totalApplicationsWhere = applicationCountCalls[0].where as {
    status: { in: ApplicationStatus[] };
  };
  assert.deepEqual(totalApplicationsWhere.status.in, [
    ApplicationStatus.SENT,
    ApplicationStatus.EMAIL_SENT,
    ApplicationStatus.EMAIL_OPENED,
  ]);

  const weeklyApplicationsWhere = applicationCountCalls[1].where as {
    status: { in: ApplicationStatus[] };
    createdAt: { gte: Date };
  };
  assert.deepEqual(weeklyApplicationsWhere.status.in, [
    ApplicationStatus.SENT,
    ApplicationStatus.EMAIL_SENT,
    ApplicationStatus.EMAIL_OPENED,
  ]);
  assert.ok(weeklyApplicationsWhere.createdAt.gte instanceof Date);

  const openedWhere = applicationCountCalls[2].where as { status: ApplicationStatus };
  assert.equal(openedWhere.status, ApplicationStatus.EMAIL_OPENED);

  const sentWhere = applicationCountCalls[3].where as { status: { in: ApplicationStatus[] } };
  assert.deepEqual(sentWhere.status.in, [
    ApplicationStatus.EMAIL_SENT,
    ApplicationStatus.EMAIL_OPENED,
  ]);
});

test('analytics service overview returns 0 percentage when no sent emails', async () => {
  const prismaMock = {
    user: {
      count: async () => 0,
    },
    job: {
      count: async () => 0,
    },
    application: {
      count: async (args?: CountCall) => {
        const where = args?.where as {
          status?: { in?: ApplicationStatus[] } | ApplicationStatus;
        };

        if (where?.status === ApplicationStatus.EMAIL_OPENED) {
          return 0;
        }

        return 0;
      },
      findMany: async () => [],
    },
    session: {
      findMany: async () => [],
    },
  };

  const service = new AnalyticsService(prismaMock as never);
  const result = await service.getOverviewStats();

  assert.equal(result.emailOpenedPercentage, 0);
});

test('analytics service getLoginsPerDay groups by day and fills missing days', async () => {
  const sessionFindManyCalls: FindManyCall[] = [];
  const oldestDay = getStartOfUtcDay(2);
  const middleDay = getStartOfUtcDay(1);
  const newestDay = getStartOfUtcDay(0);

  const prismaMock = {
    user: { count: async () => 0 },
    job: { count: async () => 0 },
    application: { count: async () => 0, findMany: async () => [] },
    session: {
      findMany: async (args: FindManyCall) => {
        sessionFindManyCalls.push(args);
        return [
          { createdAt: new Date(oldestDay.getTime() + 10 * 60 * 60 * 1000) },
          { createdAt: new Date(oldestDay.getTime() + 18 * 60 * 60 * 1000) },
          { createdAt: new Date(newestDay.getTime() + 9 * 60 * 60 * 1000) },
        ];
      },
    },
  };

  const service = new AnalyticsService(prismaMock as never);
  const result = await service.getLoginsPerDay(3);

  assert.equal(sessionFindManyCalls.length, 1);
  const where = sessionFindManyCalls[0].where as { createdAt: { gte: Date } };
  assert.ok(where.createdAt.gte instanceof Date);

  assert.deepEqual(result, [
    { date: toDateKey(oldestDay), count: 2 },
    { date: toDateKey(middleDay), count: 0 },
    { date: toDateKey(newestDay), count: 1 },
  ]);
});

test('analytics service getApplicationsPerDay filters statuses and fills gaps', async () => {
  const applicationFindManyCalls: FindManyCall[] = [];
  const oldestDay = getStartOfUtcDay(2);
  const middleDay = getStartOfUtcDay(1);
  const newestDay = getStartOfUtcDay(0);

  const prismaMock = {
    user: { count: async () => 0 },
    job: { count: async () => 0 },
    application: {
      count: async () => 0,
      findMany: async (args: FindManyCall) => {
        applicationFindManyCalls.push(args);
        return [
          { createdAt: new Date(oldestDay.getTime() + 6 * 60 * 60 * 1000) },
          { createdAt: new Date(newestDay.getTime() + 14 * 60 * 60 * 1000) },
          { createdAt: new Date(newestDay.getTime() + 16 * 60 * 60 * 1000) },
        ];
      },
    },
    session: { findMany: async () => [] },
  };

  const service = new AnalyticsService(prismaMock as never);
  const result = await service.getApplicationsPerDay(3);

  assert.equal(applicationFindManyCalls.length, 1);
  const where = applicationFindManyCalls[0].where as {
    createdAt: { gte: Date };
    status: { in: ApplicationStatus[] };
  };

  assert.ok(where.createdAt.gte instanceof Date);
  assert.deepEqual(where.status.in, [
    ApplicationStatus.SENT,
    ApplicationStatus.EMAIL_SENT,
    ApplicationStatus.EMAIL_OPENED,
  ]);

  assert.deepEqual(result, [
    { date: toDateKey(oldestDay), count: 1 },
    { date: toDateKey(middleDay), count: 0 },
    { date: toDateKey(newestDay), count: 2 },
  ]);
});

test('analytics service getEmailErrorsPerDay uses updatedAt and failed status', async () => {
  const applicationFindManyCalls: FindManyCall[] = [];
  const oldestDay = getStartOfUtcDay(2);
  const middleDay = getStartOfUtcDay(1);
  const newestDay = getStartOfUtcDay(0);

  const prismaMock = {
    user: { count: async () => 0 },
    job: { count: async () => 0 },
    application: {
      count: async () => 0,
      findMany: async (args: FindManyCall) => {
        applicationFindManyCalls.push(args);
        return [
          { updatedAt: new Date(oldestDay.getTime() + 7 * 60 * 60 * 1000) },
          { updatedAt: new Date(newestDay.getTime() + 8 * 60 * 60 * 1000) },
        ];
      },
    },
    session: { findMany: async () => [] },
  };

  const service = new AnalyticsService(prismaMock as never);
  const result = await service.getEmailErrorsPerDay(3);

  assert.equal(applicationFindManyCalls.length, 1);
  const where = applicationFindManyCalls[0].where as {
    status: ApplicationStatus;
    updatedAt: { gte: Date };
  };

  assert.equal(where.status, ApplicationStatus.FAILED);
  assert.ok(where.updatedAt.gte instanceof Date);

  assert.deepEqual(result, [
    { date: toDateKey(oldestDay), count: 1 },
    { date: toDateKey(middleDay), count: 0 },
    { date: toDateKey(newestDay), count: 1 },
  ]);
});
