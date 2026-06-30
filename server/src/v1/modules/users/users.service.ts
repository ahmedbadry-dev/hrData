import { User, Prisma, PrismaClient, UserStatus, UserRole } from '@prisma/client';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { ConflictException } from '@/shared/errors/ConflictException';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { resolvePagination, buildPaginationMeta } from '@/shared/utils/paginate.util';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetUserQuotaDto } from './dto/reset-user-quota.dto';
import {
  UserResponse,
  UserEmailQuotaResponse,
  PaginatedUsersResponse,
  UpdateUserResponse,
  SuspendUserResponse,
  ActivateUserResponse,
  RestoreUserQuotaResponse,
} from './types/user.types';
import { USERS_CONSTANTS } from './users.constants';
import { EmailQuotaService, EmailQuotaState } from '../applications/email-quota.service';

export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async getUsers(query: GetUsersDto['query']): Promise<PaginatedUsersResponse> {
    const pagination = resolvePagination(query, {
      minPage: USERS_CONSTANTS.PAGINATION.MIN_PAGE,
      defaultPage: USERS_CONSTANTS.PAGINATION.DEFAULT_PAGE,
      minLimit: USERS_CONSTANTS.PAGINATION.MIN_LIMIT,
      defaultLimit: USERS_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      maxLimit: USERS_CONSTANTS.PAGINATION.MAX_LIMIT,
    });
    const where = this.buildUsersWhere(query);

    const { users, total, quotaMap } = await this.prisma.$transaction(async (tx) => {
      const [usersResult, totalResult] = await Promise.all([
        tx.user.findMany({
          where,
          skip: pagination.skip,
          take: pagination.limit,
          orderBy: USERS_CONSTANTS.ORDER_BY.CREATED_AT_DESC,
          select: this.getUserSelectFields(),
        }),
        tx.user.count({ where }),
      ]);

      const quotas = await EmailQuotaService.resolveUsersQuotaMap(
        tx,
        usersResult.map((user) => user.id)
      );

      return {
        users: usersResult,
        total: totalResult,
        quotaMap: quotas,
      };
    });

    return {
      users: users.map((user) => this.mapUserResponse(user as User, quotaMap.get(user.id))),
      pagination: buildPaginationMeta(
        total,
        pagination.page,
        pagination.limit,
        USERS_CONSTANTS.PAGINATION.MIN_PAGE
      ),
    };
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.findUserOrThrow(userId);
    return this.mapUserResponse(user);
  }

  async updateUser(userId: string, data: UpdateUserDto['body']): Promise<UpdateUserResponse> {
    await this.findUserOrThrow(userId);

    const updateData: Prisma.UserUpdateInput = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.accountStatus !== undefined) {
      const statusMap: Record<string, UserStatus> = {
        ACTIVE: UserStatus.ACTIVE,
        SUSPENDED: UserStatus.SUSPENDED,
        PENDING_VERIFICATION: UserStatus.PENDING_VERIFICATION,
      };
      updateData.status = statusMap[data.accountStatus];
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: this.getUserSelectFields(),
    });

    return this.mapUserResponse(updatedUser as User);
  }

  async restoreUserQuota(
    userId: string,
    resetById: string,
    data: ResetUserQuotaDto['body']
  ): Promise<RestoreUserQuotaResponse> {
    const reason = data.reason.trim();
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const lockedRows = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id"
        FROM "users"
        WHERE "id" = ${userId}
        FOR UPDATE
      `;

      if (lockedRows.length === 0) {
        throw new NotFoundException(USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND);
      }

      const targetUser = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!targetUser) {
        throw new NotFoundException(USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND);
      }

      if (targetUser.role !== UserRole.USER) {
        throw new BadRequestException(USERS_CONSTANTS.MESSAGES.CANNOT_RESET_ADMIN_QUOTA);
      }

      if (targetUser.status !== UserStatus.ACTIVE) {
        throw new BadRequestException(USERS_CONSTANTS.MESSAGES.CANNOT_RESET_INACTIVE_USER_QUOTA);
      }

      const currentQuota = await EmailQuotaService.resolveUserQuota(tx, userId, { now });

      if (currentQuota.remaining > 0) {
        throw new BadRequestException(USERS_CONSTANTS.MESSAGES.QUOTA_RESTORE_NOT_ALLOWED);
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          lastQuotaResetAt: now,
          limitReachedAt: null,
        },
      });

      const reset = await tx.userQuotaReset.create({
        data: {
          userId,
          resetById,
          reason,
        },
        select: {
          id: true,
          userId: true,
          resetById: true,
          reason: true,
          createdAt: true,
        },
      });

      const quota = await EmailQuotaService.resolveUserQuota(tx, userId, { now });

      return {
        quota: this.mapQuotaResponse(quota),
        reset,
      };
    });
  }

  async suspendUser(userId: string): Promise<SuspendUserResponse> {
    const user = await this.findUserOrThrow(userId);

    if (user.role === UserRole.ADMIN) {
      throw new ConflictException(USERS_CONSTANTS.MESSAGES.CANNOT_SUSPEND_ADMIN);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ConflictException(USERS_CONSTANTS.MESSAGES.USER_ALREADY_SUSPENDED);
    }

    const suspendedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED },
      select: this.getUserSelectFields(),
    });

    return this.mapUserResponse(suspendedUser as User);
  }

  async activateUser(userId: string): Promise<ActivateUserResponse> {
    const user = await this.findUserOrThrow(userId);

    if (user.status === UserStatus.ACTIVE) {
      throw new ConflictException(USERS_CONSTANTS.MESSAGES.USER_ALREADY_ACTIVE);
    }

    const activatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE, emailVerified: true },
      select: this.getUserSelectFields(),
    });

    return this.mapUserResponse(activatedUser as User);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.findUserOrThrow(userId);

    await this.prisma.$transaction([
      this.prisma.savedJob.deleteMany({ where: { userId } }),
      this.prisma.application.deleteMany({ where: { userId } }),
      this.prisma.notification.deleteMany({ where: { userId } }),
      this.prisma.activityLog.deleteMany({ where: { userId } }),
      this.prisma.gmailToken.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  private buildUsersWhere(query: GetUsersDto['query']): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      role: UserRole.USER,
    };

    if (query.keyword) {
      where.OR = [
        { firstName: { contains: query.keyword, mode: USERS_CONSTANTS.TEXT_SEARCH_MODE } },
        { lastName: { contains: query.keyword, mode: USERS_CONSTANTS.TEXT_SEARCH_MODE } },
        { email: { contains: query.keyword, mode: USERS_CONSTANTS.TEXT_SEARCH_MODE } },
        { phone: { contains: query.keyword, mode: USERS_CONSTANTS.TEXT_SEARCH_MODE } },
      ];
    }

    if (query.status) {
      const statusMap: Record<string, UserStatus> = {
        SUSPENDED: UserStatus.SUSPENDED,
        ACTIVE: UserStatus.ACTIVE,
        PENDING_VERIFICATION: UserStatus.PENDING_VERIFICATION,
      };
      const statusValue = statusMap[query.status.toUpperCase()];
      if (statusValue) {
        where.status = statusValue;
      }
    }

    return where;
  }

  private mapUserResponse(user: User, quota?: EmailQuotaState): UserResponse {
    const response: UserResponse = {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone || null,
      joinDate: user.createdAt,
      accountStatus: user.status,
    };

    if (quota) {
      response.quota = this.mapQuotaResponse(quota);
    }

    return response;
  }

  private mapQuotaResponse(quota: EmailQuotaState): UserEmailQuotaResponse {
    return {
      emailsUsedToday: quota.emailsUsedToday,
      dailyEmailLimit: quota.dailyEmailLimit,
      remaining: quota.remaining,
      resetsAt: quota.resetsAt,
      lastQuotaResetAt: quota.lastQuotaResetAt,
      canRestore: quota.canRestore,
    };
  }

  private getUserSelectFields() {
    return {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
    };
  }

  private async findUserOrThrow(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }
}
