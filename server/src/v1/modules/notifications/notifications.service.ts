import prisma from '@/config/db.config';
import { NotFoundException } from '@/shared/errors/NotFoundException';
import { paginateResult } from '@/shared/utils/paginate.util';
import { Notification, NotificationTarget, Prisma, UserRole } from 'generated/prisma';
import { NOTIFICATIONS_MESSAGES } from './notifications.constants';
import {
  CreateNotificationInput,
  NotificationItem,
  NotificationsListResult,
} from './notifications.types';

export class NotificationsService {
  async createNotification(data: CreateNotificationInput): Promise<NotificationItem> {
    const notification = await prisma.notification.create({
      data: {
        userId: null,
        title: data.title,
        body: data.body,
        type: data.type,
        target: data.target,
      },
    });

    return this.mapNotificationItem(notification);
  }

  async listAllNotifications(page: number, limit: number): Promise<NotificationsListResult> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: null } }),
    ]);

    return {
      notifications: notifications.map((notification) => this.mapNotificationItem(notification)),
      ...paginateResult(total, page, limit),
    };
  }

  async deleteNotification(id: string): Promise<void> {
    const existing = await prisma.notification.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(NOTIFICATIONS_MESSAGES.NOT_FOUND);
    }

    await prisma.notification.delete({ where: { id } });
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
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    return {
      notifications: notifications.map((notification) => this.mapNotificationItem(notification)),
      ...paginateResult(total, page, limit),
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findFirst({
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

    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
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
}
