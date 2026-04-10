import { useOutletContext } from 'react-router-dom';
import { AdminUsersSection } from '@/components/admin/sections';
import type { AdminDashboardContextType } from './AdminDashboardLayout';

export default function AdminUsersPage() {
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    toggleUserStatus,
    deleteUser,
    openEditUser,
    openActivityId,
    setOpenActivityId
  } = useOutletContext<AdminDashboardContextType>();

  return (
    <AdminUsersSection
      users={filteredUsers}
      searchQuery={searchQuery}
      activeFilter={activeFilter}
      onSearchQueryChange={setSearchQuery}
      onFilterChange={setActiveFilter}
      onToggleStatus={toggleUserStatus}
      onDeleteUser={deleteUser}
      onEditUser={openEditUser}
      onToggleActivity={(id) => setOpenActivityId((prev) => (prev === id ? null : id))}
      openActivityId={openActivityId}
    />
  );
}
