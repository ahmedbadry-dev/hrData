import { Router } from 'express';
import { UserRole } from 'generated/prisma';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../../http/middlewares/auth.middleware';
import {
  validateBodyMiddleware,
  validateParamsMiddleware,
  validateQueryMiddleware,
} from '../../../http/middlewares/validation.middleware';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDtoSchema } from './dto/create-notification.dto';
import { GetNotificationsDtoSchema } from './dto/get-notifications.dto';
import { NotificationIdParamDtoSchema } from './dto/notification-id-param.dto';
import { NOTIFICATIONS_ROUTES } from './notifications.constants';

const notificationsService = new NotificationsService();
const notificationsController = new NotificationsController(notificationsService);

export const adminNotificationsRouter = Router();

adminNotificationsRouter.use(authenticationMiddleware);
adminNotificationsRouter.use(authorizationMiddleware(UserRole.ADMIN));

adminNotificationsRouter.post(
  NOTIFICATIONS_ROUTES.ADMIN_CREATE,
  validateBodyMiddleware(CreateNotificationDtoSchema),
  notificationsController.createNotification
);

adminNotificationsRouter.get(
  NOTIFICATIONS_ROUTES.ADMIN_LIST,
  validateQueryMiddleware(GetNotificationsDtoSchema),
  notificationsController.listAllNotifications
);

adminNotificationsRouter.delete(
  NOTIFICATIONS_ROUTES.ADMIN_DELETE,
  validateParamsMiddleware(NotificationIdParamDtoSchema),
  notificationsController.deleteNotification
);

export const userNotificationsRouter = Router();

userNotificationsRouter.use(authenticationMiddleware);

userNotificationsRouter.get(
  NOTIFICATIONS_ROUTES.MY_NOTIFICATIONS,
  validateQueryMiddleware(GetNotificationsDtoSchema),
  notificationsController.getMyNotifications
);

userNotificationsRouter.patch(
  NOTIFICATIONS_ROUTES.MARK_ALL_READ,
  notificationsController.markAllAsRead
);

userNotificationsRouter.patch(
  NOTIFICATIONS_ROUTES.MARK_READ,
  validateParamsMiddleware(NotificationIdParamDtoSchema),
  notificationsController.markAsRead
);
