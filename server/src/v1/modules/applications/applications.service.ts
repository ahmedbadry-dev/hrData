import { Application, ApplicationStatus, Prisma, PrismaClient } from '@prisma/client';
import { APPLICATIONS_CONSTANTS } from './applications.constants';
import {
  ApplicationResponse,
  EmailQuotaResponse,
  GetApplicationByIdResponse,
  GetApplicationsResponse,
  ScheduleApplicationResponse,
} from './types/applications.types';
import { jobApplicationsScheduleQueue } from '@/config/bullmq';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { TooManyRequestsException } from '@/shared/errors/TooManyRequestsException';
import { JobApplicationsScheduleJobData } from '@/workers/job-applications-schedule.worker';
import { resolvePagination, buildPaginationMeta } from '@/shared/utils/paginate.util';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/shared/utils/logger.util';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface ResolvedEmailQuotaState extends EmailQuotaResponse {
  limitReachedAt: Date | null;
}

interface EmailLimitCheckResult extends ResolvedEmailQuotaState {
  allowedCount: number;
}

const QUOTA_COUNTED_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SCHEDULED,
  ApplicationStatus.SENDING,
  ApplicationStatus.EMAIL_SENT,
];

export class ApplicationsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getApplicationsStats(userId: string): Promise<{ total: number; successful: number }> {
    const [total, successful] = await Promise.all([
      this.prisma.application.count({ where: { userId } }),
      this.prisma.application.count({
        where: {
          userId,
          status: {
            in: [
              ApplicationStatus.SENT,
              ApplicationStatus.EMAIL_SENT,
              ApplicationStatus.EMAIL_OPENED,
            ],
          },
        },
      }),
    ]);

    return { total, successful };
  }

  async getApplications(
    userId: string,
    query: { page?: number | undefined; limit?: number | undefined; status?: string | undefined }
  ): Promise<GetApplicationsResponse> {
    const { page, limit, skip } = resolvePagination(query, {
      minPage: APPLICATIONS_CONSTANTS.PAGINATION.MIN_PAGE,
      defaultPage: APPLICATIONS_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      minLimit: APPLICATIONS_CONSTANTS.PAGINATION.MIN_LIMIT,
      defaultLimit: APPLICATIONS_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      maxLimit: APPLICATIONS_CONSTANTS.PAGINATION.MAX_LIMIT,
    });

    const where: Prisma.ApplicationWhereInput = {
      userId,
      ...(query.status ? { status: query.status as ApplicationStatus } : {}),
    };

    const now = new Date();

    const { applications, total, quota } = await this.prisma.$transaction(async (tx) => {
      const [applicationsResult, totalResult, quotaResult] = await Promise.all([
        tx.application.findMany({
          where,
          include: {
            job: {
              select: {
                id: true,
                title: true,
                companyName: true,
                hrEmail: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: APPLICATIONS_CONSTANTS.ORDER_BY.CREATED_AT_DESC,
        }),
        tx.application.count({ where }),
        this.resolveEmailQuotaState(tx, userId, now),
      ]);

      return {
        applications: applicationsResult,
        total: totalResult,
        quota: quotaResult,
      };
    });

    return {
      applications: applications.map((app) => this.mapApplicationResponse(app)),
      pagination: buildPaginationMeta(
        total,
        page,
        limit,
        APPLICATIONS_CONSTANTS.PAGINATION.MIN_PAGE
      ),
      emailsUsedToday: quota.emailsUsedToday,
      dailyEmailLimit: quota.dailyEmailLimit,
      remaining: quota.remaining,
      resetsAt: quota.resetsAt,
    };
  }

  async getApplicationById(
    userId: string,
    applicationId: string
  ): Promise<GetApplicationByIdResponse> {
    const now = new Date();

    const { application, quota } = await this.prisma.$transaction(async (tx) => {
      const applicationResult = await tx.application.findFirst({
        where: { id: applicationId, userId },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
              hrEmail: true,
            },
          },
        },
      });

      if (!applicationResult) {
        throw new NotFoundException(APPLICATIONS_CONSTANTS.MESSAGES.APPLICATION_NOT_FOUND);
      }

      const quotaResult = await this.resolveEmailQuotaState(tx, userId, now);

      return {
        application: applicationResult,
        quota: quotaResult,
      };
    });

    return {
      ...this.mapApplicationResponse(application),
      emailsUsedToday: quota.emailsUsedToday,
      dailyEmailLimit: quota.dailyEmailLimit,
      remaining: quota.remaining,
      resetsAt: quota.resetsAt,
    };
  }

  async getEmailQuota(userId: string): Promise<EmailQuotaResponse> {
    return this.prisma.$transaction((tx) => this.resolveEmailQuotaState(tx, userId, new Date()));
  }

  async scheduleApplications(
    userId: string,
    jobIds: string[],
    sendTime: string,
    delayBetweenEmails?: number,
    cvFile?: MulterFile,
    emailBody?: string
  ): Promise<ScheduleApplicationResponse> {
    const uniqueJobIds = [...new Set(jobIds)];

    const savedJobs = await this.prisma.savedJob.findMany({
      where: {
        userId,
        jobId: { in: uniqueJobIds },
      },
      include: { job: true },
    });

    if (savedJobs.length !== uniqueJobIds.length) {
      throw new BadRequestException(APPLICATIONS_CONSTANTS.MESSAGES.JOB_NOT_SAVED);
    }

    if (!cvFile) {
      throw new BadRequestException(APPLICATIONS_CONSTANTS.MESSAGES.NO_DEFAULT_CV);
    }
    const delay = delayBetweenEmails ?? APPLICATIONS_CONSTANTS.DEFAULT_DELAY_BETWEEN_EMAILS_MS;
    const isImmediate = sendTime === 'immediately';
    const scheduledAt = isImmediate ? null : new Date(sendTime);

    if (!isImmediate && scheduledAt && isNaN(scheduledAt.getTime())) {
      throw new BadRequestException(APPLICATIONS_CONSTANTS.MESSAGES.INVALID_SEND_TIME);
    }

    const savedJobById = new Map(savedJobs.map((savedJob) => [savedJob.jobId, savedJob]));
    const orderedSavedJobs = uniqueJobIds
      .map((jobId) => savedJobById.get(jobId))
      .filter((savedJob): savedJob is NonNullable<typeof savedJob> => savedJob !== undefined);

    const validSavedJobs = orderedSavedJobs.filter((savedJob) => savedJob.job.hrEmail !== null);

    logger.info(
      `📅 Schedule time: sendTime="${sendTime}" → scheduledAt=${scheduledAt?.toISOString()} (isImmediate=${isImmediate})`
    );
    logger.info(`   delay between emails: ${delay}ms, total jobs: ${validSavedJobs.length}`);

    // 5. Handle CV file (Save to disk to avoid blocking the event loop with huge base64 strings in the queue)
    let cvPath: string | null = null;
    let cvFileName: string | null = null;

    if (cvFile) {
      const uploadDir = path.join('uploads', 'cvs');
      await mkdir(uploadDir, { recursive: true });

      cvFileName = cvFile.originalname;
      const safeFileName = `${uuidv4()}-${cvFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      cvPath = path.join(uploadDir, safeFileName);

      await writeFile(path.join(process.cwd(), cvPath), cvFile.buffer);
      logger.info(`💾 CV saved to disk: ${cvPath}`);
    }

    const now = new Date();

    const {
      user,
      createdApplications,
      jobsWithinLimit,
      requestedCount,
      skippedCount,
      cappedByLimit,
      quota,
    } = await this.prisma.$transaction(async (tx) => {
      const userResult = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, email: true },
      });

      if (!userResult) {
        throw new BadRequestException('User not found');
      }

      const limitCheck = await this.checkAndEnforceEmailLimit(
        tx,
        userId,
        validSavedJobs.length,
        now
      );

      if (limitCheck.allowedCount <= 0 || limitCheck.remaining <= 0) {
        const resetsAtIso = limitCheck.resetsAt ? limitCheck.resetsAt.toISOString() : '';
        throw new TooManyRequestsException(
          `${APPLICATIONS_CONSTANTS.MESSAGES.DAILY_EMAIL_LIMIT_REACHED} ${resetsAtIso}`.trim()
        );
      }

      const jobsWithinLimitResult = validSavedJobs.slice(0, limitCheck.allowedCount);
      const skippedByLimitCount = Math.max(validSavedJobs.length - jobsWithinLimitResult.length, 0);

      if (skippedByLimitCount > 0) {
        logger.warn(
          `⚠️ Email quota cap applied for user ${userId}: requested=${validSavedJobs.length}, scheduled=${jobsWithinLimitResult.length}, skipped=${skippedByLimitCount}`
        );
      }

      const existingActiveApplications = await tx.application.findMany({
        where: {
          userId,
          jobId: { in: jobsWithinLimitResult.map((savedJob) => savedJob.jobId) },
          status: { in: [ApplicationStatus.SCHEDULED, ApplicationStatus.SENDING] },
        },
        select: { jobId: true },
      });

      if (existingActiveApplications.length > 0) {
        throw new BadRequestException(
          'Some jobs already have pending applications. Please cancel them first.'
        );
      }

      const existingCancelledApplications = await tx.application.findMany({
        where: {
          userId,
          jobId: { in: jobsWithinLimitResult.map((savedJob) => savedJob.jobId) },
          status: ApplicationStatus.CANCELLED,
        },
        select: { jobId: true },
      });

      const cancelledJobIds = new Set(existingCancelledApplications.map((a) => a.jobId));

      if (cancelledJobIds.size > 0) {
        await tx.application.updateMany({
          where: {
            userId,
            jobId: { in: [...cancelledJobIds] },
            status: ApplicationStatus.CANCELLED,
          },
          data: {
            status: ApplicationStatus.SCHEDULED,
            scheduledAt,
            errorMessage: null,
            retryCount: 0,
          },
        });
      }

      const applicationsToCreate = jobsWithinLimitResult
        .filter((savedJob) => !cancelledJobIds.has(savedJob.jobId))
        .map((savedJob) => ({
          userId,
          jobId: savedJob.jobId,
          status: ApplicationStatus.SCHEDULED,
          scheduledAt,
        }));

      let createdApplicationsResult: Application[] = [];
      if (applicationsToCreate.length > 0) {
        createdApplicationsResult = await tx.application.createManyAndReturn({
          data: applicationsToCreate,
        });
      }

      const allApplications = await tx.application.findMany({
        where: {
          userId,
          jobId: { in: jobsWithinLimitResult.map((savedJob) => savedJob.jobId) },
          status: ApplicationStatus.SCHEDULED,
        },
      });

      const quotaAfterScheduling = await this.finalizeEmailQuotaAfterScheduling(
        tx,
        userId,
        limitCheck,
        allApplications.length,
        now
      );

      return {
        user: userResult,
        createdApplications: allApplications,
        jobsWithinLimit: jobsWithinLimitResult,
        requestedCount: validSavedJobs.length,
        skippedCount: skippedByLimitCount,
        cappedByLimit: skippedByLimitCount > 0,
        quota: quotaAfterScheduling,
      };
    });

    const userName = [user.firstName, user.lastName].filter(Boolean).join(' ');

    const createdApplicationsByJobId = new Map(
      createdApplications.map((createdApplication) => [
        createdApplication.jobId,
        createdApplication,
      ])
    );

    const jobsToAdd = [];

    for (let index = 0; index < jobsWithinLimit.length; index++) {
      const savedJob = jobsWithinLimit[index];
      const app = createdApplicationsByJobId.get(savedJob.jobId);
      if (!app) {
        continue;
      }

      const jobData: JobApplicationsScheduleJobData = {
        applicationId: app.id,
        userId,
        userName,
        userEmail: user.email,
        hrEmail: savedJob.job.hrEmail!,
        jobTitle: savedJob.job.title,
        companyName: savedJob.job.companyName,
        cvPath,
        cvFileName,
        emailBody,
      };

      const delayMs = isImmediate
        ? index * delay
        : scheduledAt!.getTime() - Date.now() + index * delay;

      jobsToAdd.push({
        name: jobApplicationsScheduleQueue.name,
        data: jobData,
        opts: {
          delay: delayMs,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: { count: 100 },
        },
      });
    }

    if (jobsToAdd.length > 0) {
      logger.info(`📤 Adding ${jobsToAdd.length} jobs to queue using addBulk...`);
      await jobApplicationsScheduleQueue.addBulk(jobsToAdd);
      logger.info(`✅ ${jobsToAdd.length} jobs added to queue successfully`);
    }

    void this.prisma.activityLog
      .create({
        data: {
          userId,
          action: 'SCHEDULE_APPLICATIONS',
          metadata: { count: createdApplications.length },
        },
      })
      .catch((err) => logger.error('Failed to log SCHEDULE_APPLICATIONS activity', err));

    return {
      requestedCount,
      scheduledCount: createdApplications.length,
      skippedCount,
      cappedByLimit,
      applicationIds: createdApplications.map((app) => app.id),
      emailsUsedToday: quota.emailsUsedToday,
      dailyEmailLimit: quota.dailyEmailLimit,
      remaining: quota.remaining,
      resetsAt: quota.resetsAt,
    };
  }

  async cancelApplication(userId: string, applicationId: string): Promise<void> {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
    });

    if (!application) {
      throw new NotFoundException(APPLICATIONS_CONSTANTS.MESSAGES.APPLICATION_NOT_FOUND);
    }

    if (application.status !== ApplicationStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled applications can be cancelled');
    }

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.CANCELLED },
    });

    try {
      const jobs = await jobApplicationsScheduleQueue.getJobs();
      const appJobs = jobs.filter((job) => job.data.applicationId === applicationId);
      await Promise.all(appJobs.map((job) => job.remove()));
    } catch (error) {
      logger.error(`Failed to remove BullMQ jobs for application ${applicationId}`, { error });
    }
  }

  async checkAndEnforceEmailLimit(
    tx: Prisma.TransactionClient,
    userId: string,
    requestedCount: number,
    now: Date = new Date()
  ): Promise<EmailLimitCheckResult> {
    const normalizedRequestedCount = Math.max(requestedCount, 0);
    const quotaState = await this.resolveEmailQuotaState(tx, userId, now, true);

    if (quotaState.remaining <= 0) {
      if (quotaState.limitReachedAt) {
        return {
          ...quotaState,
          allowedCount: 0,
        };
      }

      await tx.user.update({
        where: { id: userId },
        data: { limitReachedAt: now },
      });

      return {
        emailsUsedToday: quotaState.dailyEmailLimit,
        dailyEmailLimit: quotaState.dailyEmailLimit,
        remaining: 0,
        resetsAt: this.getResetAt(now),
        limitReachedAt: now,
        allowedCount: 0,
      };
    }

    return {
      ...quotaState,
      allowedCount: Math.min(normalizedRequestedCount, quotaState.remaining),
    };
  }

  private async finalizeEmailQuotaAfterScheduling(
    tx: Prisma.TransactionClient,
    userId: string,
    quotaBeforeScheduling: EmailLimitCheckResult,
    scheduledCount: number,
    now: Date
  ): Promise<EmailQuotaResponse> {
    const emailsUsedToday = Math.min(
      quotaBeforeScheduling.emailsUsedToday + scheduledCount,
      quotaBeforeScheduling.dailyEmailLimit
    );

    let limitReachedAt = quotaBeforeScheduling.limitReachedAt;

    if (emailsUsedToday >= quotaBeforeScheduling.dailyEmailLimit && !limitReachedAt) {
      await tx.user.update({
        where: { id: userId },
        data: { limitReachedAt: now },
      });
      limitReachedAt = now;
    }

    return {
      emailsUsedToday,
      dailyEmailLimit: quotaBeforeScheduling.dailyEmailLimit,
      remaining: Math.max(quotaBeforeScheduling.dailyEmailLimit - emailsUsedToday, 0),
      resetsAt: this.getResetAt(limitReachedAt),
    };
  }

  private async resolveEmailQuotaState(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date,
    lockUserRow: boolean = false
  ): Promise<ResolvedEmailQuotaState> {
    if (lockUserRow) {
      await tx.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "users"
        WHERE "id" = ${userId}
        FOR UPDATE
      `;
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dailyEmailLimit: true,
        limitReachedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const normalizedDailyLimit = this.normalizeDailyEmailLimit(user.dailyEmailLimit);

    if (user.dailyEmailLimit !== normalizedDailyLimit) {
      await tx.user.update({
        where: { id: userId },
        data: { dailyEmailLimit: normalizedDailyLimit },
      });
    }

    let limitReachedAt = user.limitReachedAt;
    const resetAt = this.getResetAt(limitReachedAt);

    if (limitReachedAt && resetAt && now >= resetAt) {
      await tx.user.update({
        where: { id: userId },
        data: { limitReachedAt: null },
      });
      limitReachedAt = null;
    }

    if (limitReachedAt) {
      return {
        emailsUsedToday: normalizedDailyLimit,
        dailyEmailLimit: normalizedDailyLimit,
        remaining: 0,
        resetsAt: this.getResetAt(limitReachedAt),
        limitReachedAt,
      };
    }

    const emailsUsedToday = await tx.application.count({
      where: {
        userId,
        status: { in: QUOTA_COUNTED_STATUSES },
        createdAt: {
          gte: this.getStartOfDay(now),
        },
      },
    });

    return {
      emailsUsedToday,
      dailyEmailLimit: normalizedDailyLimit,
      remaining: Math.max(normalizedDailyLimit - emailsUsedToday, 0),
      resetsAt: null,
      limitReachedAt: null,
    };
  }

  private normalizeDailyEmailLimit(limit: number | null | undefined): number {
    const defaultLimit = APPLICATIONS_CONSTANTS.DEFAULT_DAILY_EMAIL_LIMIT; // 50
    if (typeof limit !== 'number' || Number.isNaN(limit)) {
      return defaultLimit;
    }

    // Force limit to be at most 50 as requested by the user
    return Math.min(50, Math.max(APPLICATIONS_CONSTANTS.DAILY_EMAIL_LIMIT_MIN, Math.floor(limit)));
  }

  private getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  private getResetAt(limitReachedAt: Date | null): Date | null {
    if (!limitReachedAt) {
      return null;
    }

    return new Date(
      limitReachedAt.getTime() + APPLICATIONS_CONSTANTS.DAILY_EMAIL_LIMIT_RESET_WINDOW_MS
    );
  }

  private mapApplicationResponse(
    application: Application & {
      job: { id: string; title: string; companyName: string; hrEmail: string | null };
    }
  ): ApplicationResponse {
    return {
      id: application.id,
      jobId: application.jobId,
      status: application.status,
      scheduledAt: application.scheduledAt,
      sentAt: application.sentAt,
      openedAt: application.openedAt,
      errorMessage: application.errorMessage,
      retryCount: application.retryCount,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      job: application.job,
    };
  }
}
