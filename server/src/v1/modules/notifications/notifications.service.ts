import pLimit from 'p-limit';
import logger from '@/shared/utils/logger.util';
import { notificationsService as mailNotificationsService } from '@/notifications/notifications.service';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { paginateResult } from '@/shared/utils/paginate.util';
import {
  Notification,
  NotificationTarget,
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus,
} from 'generated/prisma';
import { NOTIFICATIONS_MESSAGES } from './notifications.constants';
import {
  CreateNotificationInput,
  NotificationItem,
  NotificationsListResult,
} from './notifications.types';

const ANNOUNCEMENT_EMAIL_CONCURRENCY = 10;

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

    void this.sendAnnouncementEmails(notification).catch((error) => {
      logger.error(`❌ Failed to send announcement emails for notification ${notification.id}`, {
        error,
      });
    });

    return this.mapNotificationItem(notification);
  }

  async listAllNotifications(page: number, limit: number): Promise<NotificationsListResult> {
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
      ...paginateResult(total, page, limit),
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
      ...paginateResult(total, page, limit),
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

  private async sendAnnouncementEmails(
    notification: Pick<Notification, 'id' | 'title' | 'body' | 'target'>
  ): Promise<void> {
    const recipients = await this.getAnnouncementRecipients(notification.target);

    if (recipients.length === 0) {
      logger.info(`📣 No recipients found for notification ${notification.id}`);
      return;
    }

    const limit = pLimit(ANNOUNCEMENT_EMAIL_CONCURRENCY);

    await Promise.all(
      recipients.map((recipient) =>
        limit(() =>
          mailNotificationsService.sendAnnouncementEmail(
            this.buildRecipientName(recipient.firstName, recipient.lastName, recipient.email),
            recipient.email,
            notification.title,
            notification.body
          )
        )
      )
    );

    logger.info(
      `📣 Announcement notification ${notification.id} processed for ${recipients.length} recipients`
    );
  }

  private async getAnnouncementRecipients(target: NotificationTarget): Promise<
    Array<{
      email: string;
      firstName: string;
      lastName: string;
    }>
  > {
    const where: Prisma.UserWhereInput = {
      status: UserStatus.ACTIVE,
      emailVerified: true,
    };

    if (target === NotificationTarget.USER) {
      where.role = UserRole.USER;
    }

    if (target === NotificationTarget.ADMIN) {
      where.role = { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] };
    }

    return this.prisma.user.findMany({
      where,
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  private buildRecipientName(firstName: string, lastName: string, email: string): string {
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || email;
  }
}
