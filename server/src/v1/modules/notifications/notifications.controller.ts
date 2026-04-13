import { NextFunction, Request, RequestHandler, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { GetNotificationsDto, GetNotificationsDtoSchema } from './dto/get-notifications.dto';
import { NotificationIdParamDto } from './dto/notification-id-param.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NOTIFICATIONS_MESSAGES } from './notifications.constants';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  createNotification: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = await this.notificationsService.createNotification(
        req.body as CreateNotificationDto['body']
      );
      ResponseHelper.created(res, data, NOTIFICATIONS_MESSAGES.CREATED, req.path);
    } catch (error) {
      next(error);
    }
  };

  listAllNotifications: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { query } = GetNotificationsDtoSchema.parse({ query: req.query });
      const { page = 1, limit = 10 } = query;
      const data = await this.notificationsService.listAllNotifications(page, limit);
      ResponseHelper.ok(res, data, NOTIFICATIONS_MESSAGES.LIST, req.path);
    } catch (error) {
      next(error);
    }
  };

  deleteNotification: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.notificationsService.deleteNotification(
        (req.params as NotificationIdParamDto['params']).id
      );
      ResponseHelper.ok(res, {}, NOTIFICATIONS_MESSAGES.DELETED, req.path);
    } catch (error) {
      next(error);
    }
  };

  getMyNotifications: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page = 1, limit = 10 } = req.query as GetNotificationsDto['query'];
      const data = await this.notificationsService.getMyNotifications(
        req.user!.id,
        req.user!.role,
        page,
        limit
      );
      ResponseHelper.ok(res, data, NOTIFICATIONS_MESSAGES.LIST, req.path);
    } catch (error) {
      next(error);
    }
  };

  markAsRead: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.notificationsService.markAsRead(
        (req.params as NotificationIdParamDto['params']).id,
        req.user!.id
      );
      ResponseHelper.ok(res, {}, NOTIFICATIONS_MESSAGES.MARKED_READ, req.path);
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.notificationsService.markAllAsRead(req.user!.id);
      ResponseHelper.ok(res, {}, NOTIFICATIONS_MESSAGES.ALL_MARKED, req.path);
    } catch (error) {
      next(error);
    }
  };
}
