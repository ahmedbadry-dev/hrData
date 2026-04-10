import { useOutletContext } from 'react-router-dom';
import { AdminAnnouncementsSection } from '@/components/admin/sections';
import type { AdminDashboardContextType } from './AdminDashboardLayout';

export default function AdminNotificationsPage() {
  const { announcements, deleteAnnouncement, openCreateAnnouncement } =
    useOutletContext<AdminDashboardContextType>();

  return (
    <AdminAnnouncementsSection
      announcements={announcements}
      onDelete={deleteAnnouncement}
      onOpenCreate={openCreateAnnouncement}
    />
  );
}
