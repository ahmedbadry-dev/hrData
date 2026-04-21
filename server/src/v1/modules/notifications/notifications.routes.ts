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
import { CreateNotificationDtoSchema } from './dto/create-notification.dto';
import { GetNotificationsDtoSchema } from './dto/get-notifications.dto';
import { NotificationIdParamDtoSchema } from './dto/notification-id-param.dto';
import { NOTIFICATIONS_ROUTES } from './notifications.constants';

export const notificationsRoutes = (
  notificationsController: NotificationsController
): { adminRouter: Router; userRouter: Router } => {
  const adminRouter = Router();

  adminRouter.use(authenticationMiddleware);
  adminRouter.use(authorizationMiddleware(UserRole.ADMIN));

  adminRouter.post(
    NOTIFICATIONS_ROUTES.ADMIN_CREATE,
    validateBodyMiddleware(CreateNotificationDtoSchema),
    notificationsController.createNotification
  );

  adminRouter.get(
    NOTIFICATIONS_ROUTES.ADMIN_LIST,
    validateQueryMiddleware(GetNotificationsDtoSchema),
    notificationsController.listAllNotifications
  );

  adminRouter.get(
    NOTIFICATIONS_ROUTES.ADMIN_ALL_NOTIFICATIONS,
    notificationsController.listAdminAllNotifications
  );

  adminRouter.delete(
    NOTIFICATIONS_ROUTES.ADMIN_DELETE,
    validateParamsMiddleware(NotificationIdParamDtoSchema),
    notificationsController.deleteNotification
  );

  const userRouter = Router();

  userRouter.use(authenticationMiddleware);

  userRouter.get(
    NOTIFICATIONS_ROUTES.MY_NOTIFICATIONS,
    validateQueryMiddleware(GetNotificationsDtoSchema),
    notificationsController.getMyNotifications
  );

  userRouter.patch(NOTIFICATIONS_ROUTES.MARK_ALL_READ, notificationsController.markAllAsRead);

  userRouter.patch(
    NOTIFICATIONS_ROUTES.MARK_READ,
    validateParamsMiddleware(NotificationIdParamDtoSchema),
    notificationsController.markAsRead
  );

  return { adminRouter, userRouter };
};
