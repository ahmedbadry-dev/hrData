import {
  ApplicationStatus,
  DateFilter,
  Job,
  JobLocation,
  JobQualification,
  JobSpecialization,
  Prisma,
  PrismaClient,
  SavedJob,
} from '@prisma/client';
import { ConflictException } from '@/shared/errors/ConflictException';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import {
  buildPaginationMeta,
  resolvePagination,
  type PaginationParams,
} from '@/shared/utils/paginate.util';
import { GetJobsDto } from './dto/get-jobs.dto';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { CreateBulkJobsDto } from './dto/create-bulk-jobs.dto';
import {
  JobResponse,
  PaginatedJobsResponse,
  SaveJobResponse,
  BulkCreateJobsResponse,
  BulkSaveJobsResponse,
  BulkUnsaveJobsResponse,
} from './types/jobs.types';
import { JOBS_CONSTANTS } from './jobs.constants';

export class JobsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getJobs(userId: string, query: GetJobsDto['query']): Promise<PaginatedJobsResponse> {
    const pagination = resolvePagination(query, {
      minPage: JOBS_CONSTANTS.PAGINATION.MIN_PAGE,
      defaultPage: JOBS_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      minLimit: JOBS_CONSTANTS.PAGINATION.MIN_LIMIT,
      defaultLimit: JOBS_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      maxLimit: JOBS_CONSTANTS.PAGINATION.MAX_LIMIT,
    });
    const where = this.buildSearchJobsWhere(query);

    return this.getPaginatedJobsWithSavedState(userId, where, pagination);
  }

  async getJobById(userId: string, jobId: string): Promise<JobResponse> {
    const job = await this.findJobOrThrow(jobId);
    const savedJob = await this.findSavedJobByUserAndJobId(userId, jobId);

    const savedSet = new Set<string>(savedJob ? [jobId] : []);

    return this.mapJobWithSaved(job, savedSet);
  }

  async getSavedJobs(userId: string, query: GetJobsDto['query']): Promise<PaginatedJobsResponse> {
    const { page, limit, skip } = resolvePagination(query, {
      minPage: JOBS_CONSTANTS.PAGINATION.MIN_PAGE,
      defaultPage: JOBS_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      minLimit: JOBS_CONSTANTS.PAGINATION.MIN_LIMIT,
      defaultLimit: JOBS_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      maxLimit: JOBS_CONSTANTS.PAGINATION.MAX_LIMIT,
    });

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
      pagination: buildPaginationMeta(total, page, limit, JOBS_CONSTANTS.PAGINATION.MIN_PAGE),
    };
  }

  async getEligibleSavedJobs(
    userId: string,
    query: GetJobsDto['query']
  ): Promise<PaginatedJobsResponse> {
    const { page, limit, skip } = resolvePagination(query, {
      minPage: JOBS_CONSTANTS.PAGINATION.MIN_PAGE,
      defaultPage: JOBS_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      minLimit: JOBS_CONSTANTS.PAGINATION.MIN_LIMIT,
      defaultLimit: JOBS_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      maxLimit: JOBS_CONSTANTS.PAGINATION.MAX_LIMIT,
    });

    const savedJobs = await this.prisma.savedJob.findMany({
      where: { userId },
      include: { job: true },
      orderBy: JOBS_CONSTANTS.ORDER_BY.CREATED_AT_DESC,
      take: 500,
    });

    if (savedJobs.length === 0) {
      return {
        jobs: [],
        pagination: buildPaginationMeta(0, page, limit, JOBS_CONSTANTS.PAGINATION.MIN_PAGE),
      };
    }

    const savedJobIds = savedJobs.map((savedJob) => savedJob.jobId);
    const applications = await this.prisma.application.findMany({
      where: {
        userId,
        jobId: { in: savedJobIds },
      },
      select: {
        jobId: true,
        status: true,
      },
      orderBy: JOBS_CONSTANTS.ORDER_BY.CREATED_AT_DESC,
    });

    const statusesByJobId = new Map<string, ApplicationStatus[]>();
    for (const application of applications) {
      const statuses = statusesByJobId.get(application.jobId) ?? [];
      statuses.push(application.status);
      statusesByJobId.set(application.jobId, statuses);
    }

    const failedStatuses = new Set<ApplicationStatus>([
      ApplicationStatus.FAILED,
      ApplicationStatus.EMAIL_FAILED,
      ApplicationStatus.CANCELLED,
    ]);

    const eligibleSavedJobs = savedJobs.filter((savedJob) => {
      if (!savedJob.job.hrEmail) {
        return false;
      }

      const statuses = statusesByJobId.get(savedJob.jobId);
      if (!statuses || statuses.length === 0) {
        return true;
      }

      return statuses.every((status) => failedStatuses.has(status));
    });

    const paginatedEligibleSavedJobs = eligibleSavedJobs.slice(skip, skip + limit);
    const paginatedSavedSet = new Set(paginatedEligibleSavedJobs.map((savedJob) => savedJob.jobId));

    return {
      jobs: paginatedEligibleSavedJobs.map((savedJob) => {
        const statuses = statusesByJobId.get(savedJob.jobId) ?? [];
        const hasPreviousFailure =
          statuses.length > 0 && statuses.every((status) => failedStatuses.has(status));

        return {
          ...this.mapJobWithSaved(savedJob.job, paginatedSavedSet),
          ...(hasPreviousFailure ? { previousFailedStatus: 'FAILED' as const } : {}),
        };
      }),
      pagination: buildPaginationMeta(
        eligibleSavedJobs.length,
        page,
        limit,
        JOBS_CONSTANTS.PAGINATION.MIN_PAGE
      ),
    };
  }

  async searchJobs(userId: string, query: SearchJobsDto['query']): Promise<PaginatedJobsResponse> {
    const pagination = resolvePagination(query, {
      minPage: JOBS_CONSTANTS.PAGINATION.MIN_PAGE,
      defaultPage: JOBS_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      minLimit: JOBS_CONSTANTS.PAGINATION.MIN_LIMIT,
      defaultLimit: JOBS_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      maxLimit: JOBS_CONSTANTS.PAGINATION.MAX_LIMIT,
    });
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

  async saveJobs(userId: string, jobIds: string[]): Promise<BulkSaveJobsResponse> {
    const uniqueJobIds = [...new Set(jobIds)];
    const existingJobs = await this.prisma.job.findMany({
      where: { id: { in: uniqueJobIds } },
      select: { id: true },
    });

    if (existingJobs.length !== uniqueJobIds.length) {
      throw new NotFoundException(JOBS_CONSTANTS.MESSAGES.JOB_NOT_FOUND);
    }

    const existingSavedJobs = await this.prisma.savedJob.findMany({
      where: { userId, jobId: { in: uniqueJobIds } },
      select: { jobId: true },
    });

    const alreadySavedJobIds = new Set(existingSavedJobs.map((savedJob) => savedJob.jobId));
    const toSaveJobIds = uniqueJobIds.filter((jobId) => !alreadySavedJobIds.has(jobId));

    if (toSaveJobIds.length > 0) {
      await this.prisma.savedJob.createMany({
        data: toSaveJobIds.map((jobId) => ({ userId, jobId })),
      });
    }

    return {
      savedJobIds: toSaveJobIds,
      alreadySavedJobIds: [...alreadySavedJobIds],
    };
  }

  async unsaveJobs(userId: string, jobIds?: string[]): Promise<BulkUnsaveJobsResponse> {
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      throw new BadRequestException('jobIds must be a non-empty array');
    }
    const uniqueJobIds = [...new Set(jobIds)];
    const existingSavedJobs = await this.prisma.savedJob.findMany({
      where: {
        userId,
        ...(uniqueJobIds ? { jobId: { in: uniqueJobIds } } : {}),
      },
      select: { jobId: true },
    });

    const removableJobIds = existingSavedJobs.map((savedJob) => savedJob.jobId);
    const removableSet = new Set(removableJobIds);
    const notSavedJobIds = uniqueJobIds
      ? uniqueJobIds.filter((jobId) => !removableSet.has(jobId))
      : [];

    if (removableJobIds.length > 0) {
      await this.prisma.savedJob.deleteMany({
        where: { userId, jobId: { in: removableJobIds } },
      });
    }

    return {
      removedJobIds: removableJobIds,
      notSavedJobIds,
    };
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

  async createBulkJobs(
    jobsData: CreateBulkJobsDto['body']['jobs']
  ): Promise<BulkCreateJobsResponse> {
    const createManyData: Prisma.JobCreateManyInput[] = jobsData.map((data) => {
      const createData: Prisma.JobCreateManyInput = {
        title: data.title,
        companyName: data.companyName,
        source: data.source,
        language: data.language || 'ar',
        location: data.location ?? null,
        category: data.category ?? null,
        description: data.description ?? null,
        hrEmail: data.hrEmail || null,
        sourceUrl: data.sourceUrl || null,
        postedAt: data.postedAt ? new Date(data.postedAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };

      return createData;
    });

    const createdJobs = await this.prisma.$transaction(async (tx) => {
      const result = await tx.job.createMany({ data: createManyData, skipDuplicates: true });

      const uniqueJobWhere: Prisma.JobWhereInput[] = createManyData.map((job) => ({
        title: job.title,
        companyName: job.companyName,
        location: job.location ?? null,
      }));

      return tx.job.findMany({
        where: {
          OR: uniqueJobWhere,
        },
        orderBy: JOBS_CONSTANTS.ORDER_BY.CREATED_AT_DESC,
      });
    });

    return {
      createdJobs: createdJobs.map((job) => this.mapJobWithSaved(job, new Set())),
      failedJobs: [],
      summary: {
        total: jobsData.length,
        created: createdJobs.length,
        failed: 0,
      },
    };
  }

  private buildBaseJobsWhere(
    query: Pick<GetJobsDto['query'], 'keyword' | 'location' | 'qualification' | 'specialization'>
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
      ...(query.qualification ? { qualification: query.qualification } : {}),
      ...(query.specialization ? { specialization: query.specialization } : {}),
    };
  }

  private buildSearchJobsWhere(
    query: Partial<
      Pick<
        SearchJobsDto['query'],
        'keyword' | 'location' | 'qualification' | 'specialization' | 'dateFilter' | 'isExpired'
      >
    >
  ): Prisma.JobWhereInput {
    const postedAgo = this.getPostedAgoDate(query.dateFilter);

    return {
      ...this.buildBaseJobsWhere(query),
      ...(query.isExpired !== undefined ? { isExpired: query.isExpired } : {}),
      ...(postedAgo ? { postedAt: { gte: postedAgo } } : {}),
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
      pagination: buildPaginationMeta(
        total,
        pagination.page,
        pagination.limit,
        JOBS_CONSTANTS.PAGINATION.MIN_PAGE
      ),
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
      qualification: job.qualification,
      specialization: job.specialization,
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
      hrEmail: job.hrEmail,
    };
  }
}
