import assert from 'node:assert/strict';
import test from 'node:test';

import { JOBS_CONSTANTS } from '../src/v1/modules/jobs/jobs.constants';
import { JobsService } from '../src/v1/modules/jobs/jobs.service';

interface JobFindManyArgs {
  where?: unknown;
  skip?: number;
  take?: number;
  orderBy?: unknown;
}

interface JobCountArgs {
  where?: unknown;
}

interface SavedJobFindManyArgs {
  where?: unknown;
  select?: unknown;
}

const createMockJob = (id: string) => {
  return {
    id,
    title: `title-${id}`,
    companyName: `company-${id}`,
    location: null,
    category: 'Engineering',
    description: 'description',
    hrEmail: null,
    source: 'linkedksa',
    sourceUrl: null,
    language: 'ar',
    postedAt: null,
    expiresAt: null,
    isExpired: false,
    createdAt: new Date('2026-04-10T00:00:00.000Z'),
    updatedAt: new Date('2026-04-10T00:00:00.000Z'),
  };
};

test('searchJobs without filters returns paginated jobs in descending db order', async () => {
  const jobFindManyCalls: JobFindManyArgs[] = [];
  const jobCountCalls: JobCountArgs[] = [];
  const savedJobFindManyCalls: SavedJobFindManyArgs[] = [];

  const jobs = [createMockJob('job-2'), createMockJob('job-1')];

  const prisma = {
    job: {
      findMany: async (args: JobFindManyArgs) => {
        jobFindManyCalls.push(args);
        return jobs;
      },
      count: async (args: JobCountArgs) => {
        jobCountCalls.push(args);
        return 25;
      },
      findUnique: async () => null,
    },
    savedJob: {
      findMany: async (args: SavedJobFindManyArgs) => {
        savedJobFindManyCalls.push(args);
        return [{ jobId: 'job-1' }];
      },
      findUnique: async () => null,
      create: async () => ({ jobId: 'job-1', createdAt: new Date('2026-04-10T00:00:00.000Z') }),
      delete: async () => ({}),
      count: async () => 0,
    },
    $transaction: async <T>(operations: Promise<T>[]) => Promise.all(operations),
  };

  const service = new JobsService(prisma as never);

  const result = await service.searchJobs('user-1', {});

  assert.equal(jobFindManyCalls.length, 1);
  assert.deepEqual(jobFindManyCalls[0].where, {});
  assert.equal(jobFindManyCalls[0].skip, 0);
  assert.equal(jobFindManyCalls[0].take, JOBS_CONSTANTS.PAGINATION.DEFAULT_LIMIT);
  assert.deepEqual(jobFindManyCalls[0].orderBy, JOBS_CONSTANTS.ORDER_BY.CREATED_AT_DESC);

  assert.equal(jobCountCalls.length, 1);
  assert.deepEqual(jobCountCalls[0].where, {});

  assert.equal(savedJobFindManyCalls.length, 1);
  const savedWhere = savedJobFindManyCalls[0].where as {
    userId: string;
    jobId: { in: string[] };
  };
  assert.equal(savedWhere.userId, 'user-1');
  assert.deepEqual(savedWhere.jobId.in, ['job-2', 'job-1']);

  assert.equal(result.jobs.length, 2);
  assert.equal(result.jobs[0].id, 'job-2');
  assert.equal(result.jobs[0].isSaved, false);
  assert.equal(result.jobs[1].id, 'job-1');
  assert.equal(result.jobs[1].isSaved, true);

  assert.deepEqual(result.pagination, {
    page: JOBS_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    limit: JOBS_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    total: 25,
    totalPages: 2,
    hasNextPage: true,
    hasPreviousPage: false,
  });
});
