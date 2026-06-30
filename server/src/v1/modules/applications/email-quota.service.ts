import { ApplicationStatus, Prisma, UserStatus } from '@prisma/client';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import { APPLICATIONS_CONSTANTS } from './applications.constants';

export interface EmailQuotaState {
  emailsUsedToday: number;
  dailyEmailLimit: number;
  remaining: number;
  resetsAt: Date | null;
  lastQuotaResetAt: Date | null;
  canRestore: boolean;
  limitReachedAt: Date | null;
  countFrom: Date;
}

type QuotaUser = {
  id: string;
  dailyEmailLimit: number;
  limitReachedAt: Date | null;
  lastQuotaResetAt: Date | null;
  status: UserStatus;
};

type QuotaUserState = {
  user: QuotaUser;
  normalizedDailyLimit: number;
  limitReachedAt: Date | null;
  countFrom: Date;
  resetsAt: Date | null;
};

export class EmailQuotaService {
  static readonly countedStatuses: ApplicationStatus[] = [
    ApplicationStatus.SCHEDULED,
    ApplicationStatus.SENDING,
    ApplicationStatus.EMAIL_SENT,
    ApplicationStatus.EMAIL_OPENED,
  ];

  static async resolveUserQuota(
    tx: Prisma.TransactionClient,
    userId: string,
    options: { now?: Date; lockUserRow?: boolean } = {}
  ): Promise<EmailQuotaState> {
    const now = options.now ?? new Date();

    if (options.lockUserRow) {
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
        lastQuotaResetAt: true,
        status: true,
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

    const userState = this.buildQuotaUserState({ ...user, dailyEmailLimit: normalizedDailyLimit }, now);

    if (user.limitReachedAt && !userState.limitReachedAt) {
      await tx.user.update({
        where: { id: userId },
        data: { limitReachedAt: null },
      });
    }

    if (userState.limitReachedAt) {
      return this.buildLockedQuotaState(userState);
    }

    const emailsUsedToday = await tx.application.count({
      where: {
        userId,
        status: { in: this.countedStatuses },
        createdAt: {
          gte: userState.countFrom,
        },
      },
    });

    return this.buildQuotaState(userState, emailsUsedToday);
  }

  static async resolveUsersQuotaMap(
    tx: Prisma.TransactionClient,
    userIds: string[],
    now: Date = new Date()
  ): Promise<Map<string, EmailQuotaState>> {
    const uniqueUserIds = [...new Set(userIds)];
    const quotaMap = new Map<string, EmailQuotaState>();

    if (uniqueUserIds.length === 0) {
      return quotaMap;
    }

    const users = await tx.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: {
        id: true,
        dailyEmailLimit: true,
        limitReachedAt: true,
        lastQuotaResetAt: true,
        status: true,
      },
    });

    const userStates = users.map((user) => this.buildQuotaUserState(user, now));
    const unlockedStates = userStates.filter((state) => !state.limitReachedAt);

    const countFilters = unlockedStates.map((state) => ({
      userId: state.user.id,
      status: { in: this.countedStatuses },
      createdAt: { gte: state.countFrom },
    }));

    const counts =
      countFilters.length > 0
        ? await tx.application.groupBy({
            by: ['userId'],
            where: { OR: countFilters },
            _count: { _all: true },
          })
        : [];

    const countsByUserId = new Map(counts.map((count) => [count.userId, count._count._all]));

    for (const state of userStates) {
      if (state.limitReachedAt) {
        quotaMap.set(state.user.id, this.buildLockedQuotaState(state));
        continue;
      }

      quotaMap.set(
        state.user.id,
        this.buildQuotaState(state, countsByUserId.get(state.user.id) ?? 0)
      );
    }

    return quotaMap;
  }

  static normalizeDailyEmailLimit(limit: number | null | undefined): number {
    const defaultLimit = APPLICATIONS_CONSTANTS.DEFAULT_DAILY_EMAIL_LIMIT;
    if (typeof limit !== 'number' || Number.isNaN(limit)) {
      return defaultLimit;
    }

    return Math.min(50, Math.max(APPLICATIONS_CONSTANTS.DAILY_EMAIL_LIMIT_MIN, Math.floor(limit)));
  }

  static getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  static getResetAt(limitReachedAt: Date | null): Date | null {
    if (!limitReachedAt) {
      return null;
    }

    return new Date(
      limitReachedAt.getTime() + APPLICATIONS_CONSTANTS.DAILY_EMAIL_LIMIT_RESET_WINDOW_MS
    );
  }

  private static buildQuotaUserState(user: QuotaUser, now: Date): QuotaUserState {
    const normalizedDailyLimit = this.normalizeDailyEmailLimit(user.dailyEmailLimit);
    const resetAt = this.getResetAt(user.limitReachedAt);
    const limitReachedAt = user.limitReachedAt && resetAt && now < resetAt ? user.limitReachedAt : null;
    const startOfDay = this.getStartOfDay(now);
    const countFrom =
      user.lastQuotaResetAt && user.lastQuotaResetAt > startOfDay
        ? user.lastQuotaResetAt
        : startOfDay;

    return {
      user,
      normalizedDailyLimit,
      limitReachedAt,
      countFrom,
      resetsAt: this.getResetAt(limitReachedAt),
    };
  }

  private static buildLockedQuotaState(state: QuotaUserState): EmailQuotaState {
    return {
      emailsUsedToday: state.normalizedDailyLimit,
      dailyEmailLimit: state.normalizedDailyLimit,
      remaining: 0,
      resetsAt: state.resetsAt,
      lastQuotaResetAt: state.user.lastQuotaResetAt,
      canRestore: state.user.status === UserStatus.ACTIVE,
      limitReachedAt: state.limitReachedAt,
      countFrom: state.countFrom,
    };
  }

  private static buildQuotaState(state: QuotaUserState, emailsUsedToday: number): EmailQuotaState {
    const remaining = Math.max(state.normalizedDailyLimit - emailsUsedToday, 0);

    return {
      emailsUsedToday,
      dailyEmailLimit: state.normalizedDailyLimit,
      remaining,
      resetsAt: null,
      lastQuotaResetAt: state.user.lastQuotaResetAt,
      canRestore: state.user.status === UserStatus.ACTIVE && remaining <= 0,
      limitReachedAt: null,
      countFrom: state.countFrom,
    };
  }
}
