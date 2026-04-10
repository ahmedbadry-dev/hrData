import { useOutletContext } from 'react-router-dom';
import { AdminHomeSection } from '@/components/admin/sections';
import { recentAdminLogs } from '@/components/admin/sections/adminData';
import type { AdminDashboardContextType } from './AdminDashboardLayout';

export default function AdminHomePage() {
  return <AdminHomeSection logs={recentAdminLogs} />;
}
