import { useState, useEffect } from 'react';
import { AdminUsersSection, AdminModals } from '@/components/admin/sections';
import {
  useUsersList,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
  useUpdateUser,
} from '@/modules/admin/users/api/hooks';
import { NotificationType, UserStatus } from '@/constants/enums';
import type { AdminUser } from '@/components/admin/sections';

type FilterValue = 'all' | UserStatus;

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'suspended',
  });

  const { data, refetch, isLoading } = useUsersList({
    page,
    keyword: debouncedSearch || undefined,
    status: activeFilter === 'all' ? undefined : activeFilter,
    limit: 20,
  });

  const suspendMutation = useSuspendUser();
  const activateMutation = useActivateUser();
  const deleteMutation = useDeleteUser();
  const updateMutation = useUpdateUser();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, debouncedSearch]);

  const users: AdminUser[] =
    data?.data?.users?.map((u, idx) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      phone: u.phone || '',
      status:
        u.accountStatus === UserStatus.ACTIVE
          ? 'active'
          : u.accountStatus === UserStatus.PENDING_VERIFICATION
            ? 'pending_verification'
            : 'suspended',
      applied: 0,
      saved: 0,
      joined: new Date(u.joinDate).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      rowIndex: idx + 1,
    })) || [];

  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleToggleStatus = (id: string | number) => {
    const user = users.find((u) => String(u.id) === String(id));
    if (!user) return;

    if (user.status === 'active') {
      suspendMutation.mutate(String(id), { onSuccess: () => refetch() });
    } else if (user.status === 'suspended') {
      activateMutation.mutate(String(id), { onSuccess: () => refetch() });
    }
  };

  const handleDeleteUser = (id: string | number) => {
    deleteMutation.mutate(String(id), { onSuccess: () => refetch() });
  };

  const handleEditUser = (id: string | number) => {
    const user = users.find((u) => String(u.id) === String(id));
    if (!user) return;
    setEditingUserId(String(id));
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status === 'active' ? 'active' : 'suspended',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingUserId) return;
    const nameParts = editForm.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const statusMap: Record<string, UserStatus.ACTIVE | UserStatus.SUSPENDED> = {
      active: UserStatus.ACTIVE,
      suspended: UserStatus.SUSPENDED,
    };
    updateMutation.mutate(
      {
        id: editingUserId,
        data: {
          firstName,
          lastName,
          phone: editForm.phone,
          accountStatus: statusMap[editForm.status],
        },
      },
      {
        onSuccess: () => {
          refetch();
          setEditOpen(false);
          setEditingUserId(null);
        },
      }
    );
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditingUserId(null);
  };

  const handleToggleActivity = (_id: string | number) => {
    // Future: show user activity details modal
  };

  const displayFilter =
    activeFilter === 'all'
      ? 'all'
      : activeFilter === UserStatus.ACTIVE
        ? 'active'
        : activeFilter === UserStatus.PENDING_VERIFICATION
          ? 'pending_verification'
          : 'suspended';

  return (
    <>
      <AdminUsersSection
        users={users}
        searchQuery={searchQuery}
        activeFilter={displayFilter}
        onSearchQueryChange={setSearchQuery}
        onFilterChange={(val) =>
          setActiveFilter(
            val === 'all'
              ? 'all'
              : val === 'active'
                ? UserStatus.ACTIVE
                : val === 'pending_verification'
                  ? UserStatus.PENDING_VERIFICATION
                  : UserStatus.SUSPENDED
          )
        }
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
        onEditUser={handleEditUser}
        onToggleActivity={handleToggleActivity}
        onSearch={() => refetch()}
        openActivityId={null}
        currentPage={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={setPage}
      />

      <AdminModals
        editOpen={editOpen}
        editForm={editForm}
        onEditChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
        onSaveEdit={handleSaveEdit}
        onCloseEdit={handleCloseEdit}
        announceOpen={false}
        announceForm={{
          title: '',
          body: '',
          type: NotificationType.INFO,
        }}
        onAnnounceChange={() => {}}
        onSaveAnnounce={() => {}}
        onCloseAnnounce={() => {}}
      />
    </>
  );
}
