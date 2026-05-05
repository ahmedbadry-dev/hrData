import logger from '@/shared/utils/logger.util';
import { notificationsService as notificationEmailService } from '@/notifications/notifications.service';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { buildPaginationMeta } from '@/shared/utils/paginate.util';
import {
  Notification,
  NotificationTarget,
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { NOTIFICATIONS_MESSAGES } from './notifications.constants';
import {
  AdminNotificationItem,
  AdminNotificationsListResult,
  CreateNotificationInput,
  NotificationItem,
  NotificationsListResult,
} from './notifications.types';

export class NotificationsService {
  constructor(private readonly prisma: PrismaClient) {}

  async createNotification(data: CreateNotificationInput): Promise<NotificationItem> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: null,
        title: data.title,
        body: data.body,
        type: data.type,
        target: data.target,
      },
    });

    void this.sendNotificationEmails({ title: data.title, body: data.body }).catch((error) => {
      logger.error(`❌ Failed to send announcement emails for notification ${notification.id}`, {
        error,
      });
    });

    return this.mapNotificationItem(notification);
  }

  async listAllNotifications(page: number, limit: number): Promise<NotificationsListResult> {
    page = Number(page || 1);
    limit = Number(limit || 10);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId: null } }),
    ]);

    return {
      notifications: notifications.map((notification) => this.mapNotificationItem(notification)),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async listAdminAllNotifications(
    page: number,
    limit: number
  ): Promise<AdminNotificationsListResult> {
    page = Number(page || 1);
    limit = Number(limit || 20);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.notification.count(),
    ]);

    return {
      notifications: notifications.map((notification) =>
        this.mapNotificationItemWithUser(notification)
      ),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async deleteNotification(id: string): Promise<void> {
    const existing = await this.prisma.notification.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(NOTIFICATIONS_MESSAGES.NOT_FOUND);
    }

    await this.prisma.notification.delete({ where: { id } });
  }

  async getMyNotifications(
    userId: string,
    role: UserRole,
    page: number,
    limit: number
  ): Promise<NotificationsListResult> {
    const skip = (page - 1) * limit;
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

    const targetFilter = isAdmin
      ? { in: [NotificationTarget.ALL, NotificationTarget.ADMIN] }
      : { in: [NotificationTarget.ALL, NotificationTarget.USER] };

    const whereClause: Prisma.NotificationWhereInput = {
      OR: [{ userId: null, target: targetFilter }, { userId }],
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: whereClause }),
    ]);

    return {
      notifications: notifications.map((notification) => this.mapNotificationItem(notification)),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        OR: [{ userId }, { userId: null }],
      },
    });

    if (!notification) {
      throw new NotFoundException(NOTIFICATIONS_MESSAGES.NOT_FOUND);
    }

    if (notification.userId === null) {
      return;
    }

    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  private mapNotificationItem(notification: Notification): NotificationItem {
    return {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      target: notification.target,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }

  private mapNotificationItemWithUser(
    notification: Notification & {
      user?: { firstName: string; lastName: string; email: string } | null;
    }
  ): AdminNotificationItem {
    return {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      target: notification.target,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      userName: notification.user
        ? `${notification.user.firstName} ${notification.user.lastName}`
        : undefined,
      userEmail: notification.user?.email ?? undefined,
    };
  }

  private async sendNotificationEmails(notificationData: {
    title: string;
    body: string;
  }): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { status: UserStatus.ACTIVE },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (users.length === 0) {
      return;
    }

    await Promise.all(
      users.map((user) =>
        notificationEmailService
          .sendNotificationEmail({
            to: user.email,
            fullName: `${user.firstName} ${user.lastName}`,
            title: notificationData.title,
            body: notificationData.body,
          })
          .catch((error) => {
            logger.error(`Failed to send notification email to ${user.email}`, { error });
          })
      )
    );
  }
}
