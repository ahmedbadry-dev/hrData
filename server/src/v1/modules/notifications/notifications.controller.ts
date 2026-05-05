import { Request, Response } from 'express';
import ResponseHelper from '@/shared/utils/api-response';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { NotificationIdParamDto } from './dto/notification-id-param.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NOTIFICATIONS_MESSAGES } from './notifications.constants';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  createNotification = async (req: Request, res: Response): Promise<Response> => {
    const data = await this.notificationsService.createNotification(
      req.body as CreateNotificationDto['body']
    );
    return ResponseHelper.created(res, data, NOTIFICATIONS_MESSAGES.CREATED, req.path);
  };

  listAllNotifications = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10 } = req.query as unknown as GetNotificationsDto['query'];
    const data = await this.notificationsService.listAllNotifications(page, limit);
    return ResponseHelper.ok(res, data, NOTIFICATIONS_MESSAGES.LIST, req.path);
  };

  listAdminAllNotifications = async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    let limit = parseInt(req.query.limit as string) || 20;
    if (limit > 100) limit = 100;
    const data = await this.notificationsService.listAdminAllNotifications(page, limit);
    return ResponseHelper.ok(res, data, NOTIFICATIONS_MESSAGES.LIST, req.path);
  };

  deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    await this.notificationsService.deleteNotification(
      (req.params as NotificationIdParamDto['params']).id
    );
    return ResponseHelper.ok(res, {}, NOTIFICATIONS_MESSAGES.DELETED, req.path);
  };

  getMyNotifications = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10 } = req.query as unknown as GetNotificationsDto['query'];
    const data = await this.notificationsService.getMyNotifications(
      req.user!.id,
      req.user!.role,
      page,
      limit
    );
    return ResponseHelper.ok(res, data, NOTIFICATIONS_MESSAGES.LIST, req.path);
  };

  markAsRead = async (req: Request, res: Response): Promise<Response> => {
    await this.notificationsService.markAsRead(
      (req.params as NotificationIdParamDto['params']).id,
      req.user!.id
    );
    return ResponseHelper.ok(res, {}, NOTIFICATIONS_MESSAGES.MARKED_READ, req.path);
  };

  markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    await this.notificationsService.markAllAsRead(req.user!.id);
    return ResponseHelper.ok(res, {}, NOTIFICATIONS_MESSAGES.ALL_MARKED, req.path);
  };
}
