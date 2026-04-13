import { useState, useEffect } from 'react';
import { AdminUsersSection, AdminModals } from '@/components/admin/sections';
import {
  useUsersListInfinite,
  useSuspendUser,
  useActivateUser,
  useDeleteUser,
  useUpdateUser,
} from '@/modules/admin/users/api/hooks';
import type { AdminUser } from '@/components/admin/sections';

type FilterValue = 'all' | 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'suspended',
  });

  const { data, refetch } = useUsersListInfinite({
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
    refetch();
  }, [activeFilter]);

  const users: AdminUser[] =
    data?.pages
      .flatMap((page) => page.data?.users ?? [])
      ?.map((u, idx) => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: u.phone || '',
        status:
          u.accountStatus === 'ACTIVE'
            ? 'active'
            : u.accountStatus === 'PENDING_VERIFICATION'
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

  const handleToggleStatus = (id: string | number) => {
    const user = users.find((u) => String(u.id) === String(id));
    if (!user) return;

    if (user.status === 'active') {
      suspendMutation.mutate(String(id), { onSuccess: () => refetch() });
    } else {
      activateMutation.mutate(String(id), { onSuccess: () => refetch() });
    }
  };

  const handleDeleteUser = (id: string | number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
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
    updateMutation.mutate(
      { id: editingUserId, data: { fullName: editForm.name } },
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
      : activeFilter === 'ACTIVE'
        ? 'active'
        : activeFilter === 'PENDING_VERIFICATION'
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
                ? 'ACTIVE'
                : val === 'pending_verification'
                  ? 'PENDING_VERIFICATION'
                  : 'SUSPENDED'
          )
        }
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
        onEditUser={handleEditUser}
        onToggleActivity={handleToggleActivity}
        onSearch={() => refetch()}
        openActivityId={null}
      />

      <AdminModals
        editOpen={editOpen}
        editForm={editForm}
        onEditChange={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
        onSaveEdit={handleSaveEdit}
        onCloseEdit={handleCloseEdit}
        announceOpen={false}
        announceForm={{ title: '', body: '', type: 'info', target: '' }}
        onAnnounceChange={() => {}}
        onSaveAnnounce={() => {}}
        onCloseAnnounce={() => {}}
      />
    </>
  );
}
