import { DateFilter, Job, Prisma, PrismaClient, SavedJob } from 'generated/prisma';
import { ConflictException } from '@/shared/errors/ConflictException';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { PaginationMeta } from '@/shared/utils/api-response';
import { GetJobsDto } from './dto/get-jobs.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateBulkJobsDto } from './dto/create-bulk-jobs.dto';
import {
  JobResponse,
  PaginatedJobsResponse,
  SaveJobResponse,
  BulkCreateJobsResponse,
} from './types/jobs.types';
import { JOBS_CONSTANTS } from './jobs.constants';

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export class JobsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getJobs(userId: string, query: GetJobsDto['query']): Promise<PaginatedJobsResponse> {
    const pagination = this.resolvePagination(query);
    const where = this.buildBaseJobsWhere(query);

    return this.getPaginatedJobsWithSavedState(userId, where, pagination);
  }

  async getJobById(userId: string, jobId: string): Promise<JobResponse> {
    const job = await this.findJobOrThrow(jobId);
    const savedJob = await this.findSavedJobByUserAndJobId(userId, jobId);

    const savedSet = new Set<string>(savedJob ? [jobId] : []);

    return this.mapJobWithSaved(job, savedSet);
  }

  async getSavedJobs(userId: string, query: GetJobsDto['query']): Promise<PaginatedJobsResponse> {
    const { page, limit, skip } = this.resolvePagination(query);

    const [savedJobs, total] = await this.prisma.$transaction([
      this.prisma.savedJob.findMany({
        where: { userId },
        include: { job: true },
        skip,
        take: limit,
        orderBy: JOBS_CONSTANTS.ORDER_BY.CREATED_AT_DESC,
      }),
      this.prisma.savedJob.count({ where: { userId } }),
    ]);

    const savedSet = new Set(savedJobs.map((savedJob) => savedJob.jobId));

    return {
      jobs: savedJobs.map((savedJob) => this.mapJobWithSaved(savedJob.job, savedSet)),
      pagination: this.buildPaginationMeta(total, page, limit),
    };
  }

  async searchJobs(userId: string, query: SearchJobsDto['query']): Promise<PaginatedJobsResponse> {
    const pagination = this.resolvePagination(query);
    const where = this.buildSearchJobsWhere(query);

    return this.getPaginatedJobsWithSavedState(userId, where, pagination);
  }

  async saveJob(userId: string, jobId: string): Promise<SaveJobResponse> {
    await this.findJobOrThrow(jobId);
    const existingSavedJob = await this.findSavedJobByUserAndJobId(userId, jobId);

    if (existingSavedJob) {
      throw new ConflictException(JOBS_CONSTANTS.MESSAGES.JOB_ALREADY_SAVED);
    }

    const savedJob = await this.prisma.savedJob.create({
      data: {
        userId,
        jobId,
      },
    });

    return {
      jobId: savedJob.jobId,
      savedAt: savedJob.createdAt,
    };
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    await this.findJobOrThrow(jobId);
    const existingSavedJob = await this.findSavedJobByUserAndJobId(userId, jobId);

    if (!existingSavedJob) {
      throw new NotFoundException(JOBS_CONSTANTS.MESSAGES.SAVED_JOB_NOT_FOUND);
    }

    await this.prisma.savedJob.delete({
      where: this.buildSavedJobLookupWhere(userId, jobId),
    });
  }

  async createJob(data: CreateJobDto['body']): Promise<JobResponse> {
    const createData: Parameters<typeof this.prisma.job.create>[0]['data'] = {
      title: data.title,
      companyName: data.companyName,
      source: data.source,
      language: data.language || 'ar',
    };

    if (data.location) createData.location = data.location;
    if (data.category) createData.category = data.category;
    if (data.description) createData.description = data.description;
    if (data.hrEmail) createData.hrEmail = data.hrEmail;
    if (data.sourceUrl) createData.sourceUrl = data.sourceUrl;
    if (data.postedAt) createData.postedAt = new Date(data.postedAt);
    if (data.expiresAt) createData.expiresAt = new Date(data.expiresAt);

    try {
      const job = await this.prisma.job.create({
        data: createData,
      });

      return this.mapJobWithSaved(job, new Set());
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(JOBS_CONSTANTS.MESSAGES.JOB_ALREADY_EXISTS);
      }

      throw error;
    }
  }

  // TODO: remove this method its just for testing bulk creation
  async createBulkJobs(
    jobsData: CreateBulkJobsDto['body']['jobs']
  ): Promise<BulkCreateJobsResponse> {
    const createdJobs: JobResponse[] = [];
    const failedJobs: BulkCreateJobsResponse['failedJobs'] = [];

    for (let index = 0; index < jobsData.length; index++) {
      const data = jobsData[index];

      try {
        const createData: Parameters<typeof this.prisma.job.create>[0]['data'] = {
          title: data.title,
          companyName: data.companyName,
          source: data.source,
          language: data.language || 'ar',
        };

        if (data.location) createData.location = data.location;
        if (data.category) createData.category = data.category;
        if (data.description) createData.description = data.description;
        if (data.hrEmail) createData.hrEmail = data.hrEmail;
        if (data.sourceUrl) createData.sourceUrl = data.sourceUrl;
        if (data.postedAt) createData.postedAt = new Date(data.postedAt);
        if (data.expiresAt) createData.expiresAt = new Date(data.expiresAt);

        const job = await this.prisma.job.create({
          data: createData,
        });

        createdJobs.push(this.mapJobWithSaved(job, new Set()));
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          failedJobs.push({
            index,
            title: data.title,
            companyName: data.companyName,
            reason: JOBS_CONSTANTS.MESSAGES.JOB_ALREADY_EXISTS,
          });
        } else {
          failedJobs.push({
            index,
            title: data.title,
            companyName: data.companyName,
            reason: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return {
      createdJobs,
      failedJobs,
      summary: {
        total: jobsData.length,
        created: createdJobs.length,
        failed: failedJobs.length,
      },
    };
  }

  private resolvePagination(query: {
    page?: number | undefined;
    limit?: number | undefined;
  }): PaginationParams {
    const page = Number(query.page ?? JOBS_CONSTANTS.PAGINATION.DEFAULT_PAGE);
    const limit = Number(query.limit ?? JOBS_CONSTANTS.PAGINATION.DEFAULT_LIMIT);
    const skip = (page - JOBS_CONSTANTS.PAGINATION.MIN_PAGE) * limit;

    return { page, limit, skip };
  }

  private buildBaseJobsWhere(
    query: Pick<GetJobsDto['query'], 'keyword' | 'location'>
  ): Prisma.JobWhereInput {
    return {
      ...(query.keyword
        ? {
            OR: [
              {
                title: {
                  contains: query.keyword,
                  mode: JOBS_CONSTANTS.TEXT_SEARCH_MODE,
                },
              },
              {
                companyName: {
                  contains: query.keyword,
                  mode: JOBS_CONSTANTS.TEXT_SEARCH_MODE,
                },
              },
            ],
          }
        : {}),
      ...(query.location ? { location: query.location } : {}),
    };
  }

  private buildSearchJobsWhere(query: SearchJobsDto['query']): Prisma.JobWhereInput {
    const postedAgo = this.getPostedAgoDate(query.dateFilter);

    return {
      ...this.buildBaseJobsWhere(query),
      ...(postedAgo ? { postedAt: { lte: postedAgo } } : {}),
    };
  }

  private getPostedAgoDate(dateFilter?: DateFilter): Date | undefined {
    if (dateFilter === DateFilter.DAY) {
      return new Date(Date.now() - JOBS_CONSTANTS.DATE_FILTER_MS.DAY);
    }

    if (dateFilter === DateFilter.WEEK) {
      return new Date(Date.now() - JOBS_CONSTANTS.DATE_FILTER_MS.WEEK);
    }

    if (dateFilter === DateFilter.MONTH) {
      return new Date(Date.now() - JOBS_CONSTANTS.DATE_FILTER_MS.MONTH);
    }

    return undefined;
  }

  private async getPaginatedJobsWithSavedState(
    userId: string,
    where: Prisma.JobWhereInput,
    pagination: PaginationParams
  ): Promise<PaginatedJobsResponse> {
    const [jobs, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: JOBS_CONSTANTS.ORDER_BY.CREATED_AT_DESC,
      }),
      this.prisma.job.count({ where }),
    ]);

    const savedSet = await this.getSavedJobIds(
      userId,
      jobs.map((job) => job.id)
    );

    return {
      jobs: jobs.map((job) => this.mapJobWithSaved(job, savedSet)),
      pagination: this.buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  private async findJobOrThrow(jobId: string): Promise<Job> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(JOBS_CONSTANTS.MESSAGES.JOB_NOT_FOUND);
    }

    return job;
  }

  private buildSavedJobLookupWhere(userId: string, jobId: string): Prisma.SavedJobWhereUniqueInput {
    return {
      userId_jobId: {
        userId,
        jobId,
      },
    };
  }

  private async findSavedJobByUserAndJobId(
    userId: string,
    jobId: string
  ): Promise<SavedJob | null> {
    return this.prisma.savedJob.findUnique({
      where: this.buildSavedJobLookupWhere(userId, jobId),
    });
  }

  private buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > JOBS_CONSTANTS.PAGINATION.MIN_PAGE,
    };
  }

  private async getSavedJobIds(userId: string, jobIds: string[]): Promise<Set<string>> {
    if (jobIds.length === 0) {
      return new Set();
    }

    const savedJobs = await this.prisma.savedJob.findMany({
      where: {
        userId,
        jobId: {
          in: jobIds,
        },
      },
      select: {
        jobId: true,
      },
    });

    return new Set(savedJobs.map((savedJob) => savedJob.jobId));
  }

  private mapJobWithSaved(job: Job, savedSet: Set<string>): JobResponse {
    return {
      id: job.id,
      title: job.title,
      companyName: job.companyName,
      location: job.location,
      category: job.category,
      description: job.description,
      source: job.source,
      sourceUrl: job.sourceUrl,
      language: job.language,
      postedAt: job.postedAt,
      expiresAt: job.expiresAt,
      isExpired: job.isExpired,
      isSaved: savedSet.has(job.id),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
