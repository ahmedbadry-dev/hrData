import { Application, ApplicationStatus, Prisma, PrismaClient } from 'generated/prisma';

import { APPLICATIONS_CONSTANTS } from './applications.constants';
import {
  ApplicationResponse,
  PaginatedApplicationsResponse,
  ScheduleApplicationResponse,
} from './types/applications.types';
import { jobApplicationsScheduleQueue } from '@/config/bullmq';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { JobApplicationsScheduleJobData } from '@/workers/job-applications-schedule.worker';
import { resolvePagination, buildPaginationMeta } from '@/shared/utils/paginate.util';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export class ApplicationsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getApplications(
    userId: string,
    query: { page?: number | undefined; limit?: number | undefined; status?: string | undefined }
  ): Promise<PaginatedApplicationsResponse> {
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

    const [applications, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
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
        orderBy: APPLICATIONS_CONSTANTS.ORDER_BY.STATUS_PENDING_FIRST,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      applications: applications.map((app) => this.mapApplicationResponse(app)),
      pagination: buildPaginationMeta(
        total,
        page,
        limit,
        APPLICATIONS_CONSTANTS.PAGINATION.MIN_PAGE
      ),
    };
  }

  async getApplicationById(userId: string, applicationId: string): Promise<ApplicationResponse> {
    const application = await this.prisma.application.findFirst({
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

    if (!application) {
      throw new NotFoundException(APPLICATIONS_CONSTANTS.MESSAGES.APPLICATION_NOT_FOUND);
    }

    return this.mapApplicationResponse(application);
  }

  async scheduleApplications(
    userId: string,
    jobIds: string[],
    sendTime: string,
    delayBetweenEmails?: number,
    cvFile?: MulterFile
  ): Promise<ScheduleApplicationResponse> {
    const savedJobs = await this.prisma.savedJob.findMany({
      where: {
        userId,
        jobId: { in: jobIds },
      },
      include: { job: true },
    });

    if (savedJobs.length !== jobIds.length) {
      throw new BadRequestException(APPLICATIONS_CONSTANTS.MESSAGES.JOB_NOT_SAVED);
    }

    if (!cvFile) {
      throw new BadRequestException(APPLICATIONS_CONSTANTS.MESSAGES.NO_DEFAULT_CV);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const delay = delayBetweenEmails ?? APPLICATIONS_CONSTANTS.DEFAULT_DELAY_BETWEEN_EMAILS_MS;
    const isImmediate = sendTime === 'immediately';
    const scheduledAt = isImmediate ? null : new Date(sendTime);

    const validSavedJobs = savedJobs.filter((savedJob) => Boolean(savedJob.job.hrEmail));

    console.log(
      `📅 Schedule time: sendTime="${sendTime}" → scheduledAt=${scheduledAt?.toISOString()} (isImmediate=${isImmediate})`
    );
    console.log(`   delay between emails: ${delay}ms, total jobs: ${validSavedJobs.length}`);

    if (validSavedJobs.length === 0) {
      throw new BadRequestException(APPLICATIONS_CONSTANTS.MESSAGES.NO_VALID_HR_EMAILS);
    }

    const cvData = cvFile.buffer.toString('base64');
    const cvFileName = cvFile.originalname;

    const applicationsToCreate = validSavedJobs.map((savedJob) => ({
      userId,
      jobId: savedJob.jobId,
      status: ApplicationStatus.SCHEDULED,
      scheduledAt,
    }));

    const createdApplications = await this.prisma.application.createManyAndReturn({
      data: applicationsToCreate,
    });

    const createdApplicationsByJobId = new Map(
      createdApplications.map((createdApplication) => [
        createdApplication.jobId,
        createdApplication,
      ])
    );

    for (let index = 0; index < validSavedJobs.length; index++) {
      const savedJob = validSavedJobs[index];
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
        cvData,
        cvFileName,
      };

      if (isImmediate) {
        const delayMs = index * delay;
        await jobApplicationsScheduleQueue.add(jobApplicationsScheduleQueue.name, jobData, {
          delay: delayMs,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: true,
        });
      } else {
        await jobApplicationsScheduleQueue.add(jobApplicationsScheduleQueue.name, jobData, {
          delay: scheduledAt!.getTime() - Date.now() + index * delay,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: true,
        });
      }
    }

    return {
      scheduledCount: createdApplications.length,
      applicationIds: createdApplications.map((app) => app.id),
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

    await this.prisma.application.delete({
      where: { id: applicationId },
    });
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
