import { AdminHomeSection } from '@/components/admin/sections';
import { recentAdminLogs } from '@/components/admin/sections/adminData';

export default function AdminHomePage() {
  return <AdminHomeSection logs={recentAdminLogs} />;
}
