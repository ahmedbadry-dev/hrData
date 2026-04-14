import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AdminAnnouncementsSection,
  AdminModals,
  NOTIFICATION_TYPE_TO_UI,
  type AnnouncementForm,
} from '@/components/admin/sections';
import {
  useNotificationsList,
  useCreateNotification,
  useDeleteNotification,
} from '@/modules/admin/notifications/api/hooks';
import { NotificationType, NotificationTarget } from '@/constants/enums';
import type { AdminDashboardContextType } from './AdminDashboardLayout';

export default function AdminNotificationsPage() {
  const { showToast } = useOutletContext<AdminDashboardContextType>();
  const { data, refetch } = useNotificationsList({ limit: 20 });
  const createMutation = useCreateNotification();
  const deleteMutation = useDeleteNotification();
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announceForm, setAnnounceForm] = useState<AnnouncementForm>({
    title: '',
    body: '',
    type: NotificationType.INFO,
  });

  const announcements =
    data?.data?.notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: NOTIFICATION_TYPE_TO_UI[n.type] ?? 'info',
      target: n.target,
      date: new Date(n.createdAt).toLocaleDateString('ar-SA'),
    })) || [];

  const handleDelete = (id: string | number) => {
    if (!window.confirm('حذف هذا الإشعار؟')) return;
    deleteMutation.mutate(String(id), {
      onSuccess: () => {
        refetch();
        showToast('تم حذف الإشعار بنجاح');
      },
      onError: () => {
        showToast('تعذّر حذف الإشعار حالياً', 'error');
      },
    });
  };

  const handleOpenCreate = () => {
    setAnnounceOpen(true);
  };

  const handleCloseCreate = () => {
    setAnnounceOpen(false);
  };

  const handleAnnounceChange = (patch: Partial<AnnouncementForm>) => {
    setAnnounceForm((prev) => ({ ...prev, ...patch }));
  };

  const handleCreate = () => {
    const title = announceForm.title.trim();
    const body = announceForm.body.trim();

    if (!title || !body) {
      showToast('العنوان والنص مطلوبان', 'error');
      return;
    }

    createMutation.mutate(
      {
        title,
        body,
        type: announceForm.type,
        target: NotificationTarget.ALL,
      },
      {
        onSuccess: () => {
          refetch();
          setAnnounceOpen(false);
          setAnnounceForm({ title: '', body: '', type: NotificationType.INFO });
          showToast('تم إرسال الإشعار بنجاح');
        },
        onError: () => {
          showToast('تعذّر إرسال الإشعار حالياً', 'error');
        },
      }
    );
  };

  return (
    <>
      <AdminAnnouncementsSection
        announcements={announcements}
        onDelete={handleDelete}
        onOpenCreate={handleOpenCreate}
      />

      <AdminModals
        editOpen={false}
        editForm={{ name: '', email: '', phone: '', status: 'active' }}
        onEditChange={() => {}}
        onSaveEdit={() => {}}
        onCloseEdit={() => {}}
        announceOpen={announceOpen}
        announceForm={announceForm}
        onAnnounceChange={handleAnnounceChange}
        onSaveAnnounce={handleCreate}
        onCloseAnnounce={handleCloseCreate}
        announceSubmitting={createMutation.isPending}
      />
    </>
  );
}
