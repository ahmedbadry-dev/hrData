import { AdminAnnouncementsSection, NOTIFICATION_TYPE_TO_UI } from '@/components/admin/sections';
import {
  useNotificationsList,
  useCreateNotification,
  useDeleteNotification,
} from '@/modules/admin/notifications/api/hooks';
import { NotificationType, NotificationTarget } from '@/constants/enums';

export default function AdminNotificationsPage() {
  const { data, refetch } = useNotificationsList({ limit: 20 });
  const createMutation = useCreateNotification();
  const deleteMutation = useDeleteNotification();

  const announcements =
    data?.data?.notifications.map((n) => ({
      id: Number(n.id),
      title: n.title,
      body: n.body,
      type: NOTIFICATION_TYPE_TO_UI[n.type] ?? 'info',
      target: n.target,
      date: new Date(n.createdAt).toLocaleDateString('ar-SA'),
    })) || [];

  const handleDelete = (id: number) => {
    if (!window.confirm('حذف هذا الإشعار؟')) return;
    deleteMutation.mutate(String(id), { onSuccess: () => refetch() });
  };

  const handleCreate = () => {
    const title = window.prompt('عنوان الإشعار');
    if (!title) return;
    const body = window.prompt('محتوى الإشعار') || '';
    createMutation.mutate(
      { title, body, type: NotificationType.INFO, target: NotificationTarget.ALL },
      { onSuccess: () => refetch() }
    );
  };

  return (
    <AdminAnnouncementsSection
      announcements={announcements}
      onDelete={handleDelete}
      onOpenCreate={handleCreate}
    />
  );
}
