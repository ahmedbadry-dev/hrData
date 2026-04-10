import { User, Prisma, PrismaClient, UserStatus, UserRole } from 'generated/prisma';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { ConflictException } from '@/shared/errors/ConflictException';
import { PaginationMeta } from '@/shared/utils/api-response';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserResponse,
  PaginatedUsersResponse,
  UpdateUserResponse,
  SuspendUserResponse,
  ActivateUserResponse,
} from './types/user.types';
import { USERS_CONSTANTS } from './users.constants';

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async getUsers(query: GetUsersDto['query']): Promise<PaginatedUsersResponse> {
    const pagination = this.resolvePagination(query);
    const where = this.buildUsersWhere(query);

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: USERS_CONSTANTS.ORDER_BY.CREATED_AT_DESC,
        select: this.getUserSelectFields(),
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => this.mapUserResponse(user as User)),
      pagination: this.buildPaginationMeta(total, pagination.page, pagination.limit),
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

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: this.getUserSelectFields(),
    });

    return this.mapUserResponse(updatedUser as User);
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

    if (user.status !== UserStatus.SUSPENDED) {
      throw new ConflictException(USERS_CONSTANTS.MESSAGES.USER_ALREADY_ACTIVE);
    }

    const activatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
      select: this.getUserSelectFields(),
    });

    return this.mapUserResponse(activatedUser as User);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.findUserOrThrow(userId);

    // Delete related records first (cascade delete)
    await this.prisma.$transaction([
      this.prisma.session.deleteMany({ where: { userId } }),
      this.prisma.savedJob.deleteMany({ where: { userId } }),
      this.prisma.cv.deleteMany({ where: { userId } }),
      this.prisma.emailTemplate.deleteMany({ where: { userId } }),
      this.prisma.application.deleteMany({ where: { userId } }),
      this.prisma.notification.deleteMany({ where: { userId } }),
      this.prisma.activityLog.deleteMany({ where: { userId } }),
      this.prisma.gmailToken.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
  }

  // ============ Private Helper Methods ============

  private resolvePagination(query: GetUsersDto['query']): PaginationParams {
    const page = query.page || USERS_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = query.limit || USERS_CONSTANTS.PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private buildUsersWhere(query: GetUsersDto['query']): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (query.keyword) {
      where.OR = [
        { fullName: { contains: query.keyword, mode: USERS_CONSTANTS.TEXT_SEARCH_MODE } },
        { email: { contains: query.keyword, mode: USERS_CONSTANTS.TEXT_SEARCH_MODE } },
        { phone: { contains: query.keyword, mode: USERS_CONSTANTS.TEXT_SEARCH_MODE } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    return where;
  }

  private buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > USERS_CONSTANTS.PAGINATION.MIN_PAGE,
    };
  }

  private mapUserResponse(user: User & { fullName?: string | null }): UserResponse {
    return {
      id: user.id,
      fullName: user.fullName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone || null,
      joinDate: user.createdAt,
      accountStatus: user.status,
    };
  }

  private getUserSelectFields() {
    return {
      id: true,
      firstName: true,
      lastName: true,
      fullName: true,
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
