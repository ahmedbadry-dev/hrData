import { useState } from 'react';
import type { AdminUser } from '@/components/admin/sections/adminData';
import { EmptyState, PageHeader, SearchBox } from '@/components/common';
import { Avatar, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/pagination';
import styles from './AdminUsersSection.module.css';

interface AdminUsersSectionProps {
  users: AdminUser[];
  searchQuery: string;
  activeFilter: 'all' | 'active' | 'suspended' | 'pending_verification';
  onSearchQueryChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'active' | 'suspended' | 'pending_verification') => void;
  onToggleStatus: (id: string | number) => void;
  onDeleteUser: (id: string | number) => void;
  onEditUser: (id: string | number) => void;
  onToggleActivity: (id: string | number) => void;
  onRestoreQuota: (id: string | number) => void;
  onSearch?: () => void;
  openActivityId: string | number | null;
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

const getStatusLabel = (status: AdminUser['status']) => {
  if (status === 'active') return 'نشط';
  if (status === 'pending_verification') return 'بانتظار التفعيل';
  return 'موقوف';
};

export default function AdminUsersSection({
  users,
  searchQuery,
  activeFilter,
  onSearchQueryChange,
  onFilterChange,
  onToggleStatus,
  onDeleteUser,
  onEditUser,
  onToggleActivity,
  onRestoreQuota,
  onSearch,
  openActivityId,
  currentPage = 1,
  totalPages = 1,
  isLoading,
  onPageChange,
}: AdminUsersSectionProps) {
  const activeUser = users.find((u) => String(u.id) === String(openActivityId)) ?? null;
  const [pendingDelete, setPendingDelete] = useState<string | number | null>(null);

  const handleDeleteClick = (id: string | number) => {
    setPendingDelete(id);
  };

  const handleConfirmDelete = () => {
    if (pendingDelete !== null) {
      onDeleteUser(pendingDelete);
      setPendingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  return (
    <>
      {pendingDelete !== null && (
        <div className={styles['confirm-overlay']} onClick={handleCancelDelete}>
          <div className={styles['confirm-dialog']} onClick={(e) => e.stopPropagation()}>
            <p className={styles['confirm-text']}>هل أنت متأكد من حذف هذا المستخدم؟</p>
            <div className={styles['confirm-actions']}>
              <Button className={styles['confirm-btn-cancel']} onClick={handleCancelDelete}>
                إلغاء
              </Button>
              <Button className={styles['confirm-btn-delete']} onClick={handleConfirmDelete}>
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}

      <section>
        <PageHeader
          eyebrow="الإدارة"
          title="إدارة المستخدمين"
          eyebrowClassName={styles['section-eyebrow']}
          titleClassName={styles['section-headline']}
        />

        <SearchBox
          value={searchQuery}
          onChange={onSearchQueryChange}
          onSubmit={onSearch}
          placeholder="ابحث بالاسم أو البريد أو الجوال..."
          buttonLabel="بحث"
          className={styles['search-box']}
        />

        <div className={styles['filter-row']}>
          <Button
            className={cn(styles['filter-btn'], activeFilter === 'all' && styles.active)}
            onClick={() => onFilterChange('all')}
          >
            الكل
          </Button>
          <Button
            className={cn(styles['filter-btn'], activeFilter === 'active' && styles.active)}
            onClick={() => onFilterChange('active')}
          >
            نشط
          </Button>
          <Button
            className={cn(
              styles['filter-btn'],
              activeFilter === 'pending_verification' && styles.active
            )}
            onClick={() => onFilterChange('pending_verification')}
          >
            بانتظار التفعيل
          </Button>
          <Button
            className={cn(styles['filter-btn'], activeFilter === 'suspended' && styles.active)}
            onClick={() => onFilterChange('suspended')}
          >
            موقوف
          </Button>
        </div>

        {users.length === 0 ? (
          <EmptyState
            symbol={
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            }
            title="لا يوجد مستخدمون"
            description="لن تجد مستخدمين بهذا الفلتر"
            className={styles['welcome-state']}
          />
        ) : (
          <>
            <div className={styles['control-bar']}>
              <span className={styles['count-label']}>{users.length} مستخدم</span>
              <span className={styles['helper-label']}>
                اضغط "نشاط" لتفاصيل المستخدم
              </span>
            </div>

            <div className={styles['admin-table-wrap']}>
              <table className={styles['admin-table']}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>المستخدم</th>
                    <th>الجوال</th>
                    <th>تاريخ الانضمام</th>
                    <th>الحالة</th>
                    <th>الكوتة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr style={{ animationDelay: `${i * 0.05}s` }} key={u.id}>
                      <td className={styles['id-cell']}>{u.rowIndex}</td>
                      <td>
                        <div className={styles['user-cell']}>
                          <Avatar name={u.name} className={styles['user-avatar']} />
                          <div>
                            <div className={styles['user-name']}>{u.name}</div>
                            <div className={styles['user-email']}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.phone}>{u.phone}</td>
                      <td className={styles.joined}>{u.joined}</td>
                      <td>
                        <Badge className={cn(styles['status-badge'], styles[u.status])}>
                          {getStatusLabel(u.status)}
                        </Badge>
                      </td>
                      <td>
                        {u.quota ? (
                          <div
                            className={cn(
                              styles['quota-cell'],
                              u.quota.remaining <= 0 && styles['quota-empty']
                            )}
                          >
                            <span className={styles['quota-main']}>
                              {u.quota.emailsUsedToday}/{u.quota.dailyEmailLimit}
                            </span>
                            <span className={styles['quota-sub']}>متبقي {u.quota.remaining}</span>
                          </div>
                        ) : (
                          <span className={styles['quota-muted']}>-</span>
                        )}
                      </td>
                      <td>
                        <Button
                          className={cn(styles['action-btn'], styles.gold)}
                          onClick={() => onToggleActivity(u.id)}
                        >
                          نشاط
                        </Button>
                        <Button className={styles['action-btn']} onClick={() => onEditUser(u.id)}>
                          تعديل
                        </Button>
                        <Button
                          className={cn(styles['action-btn'], styles.success)}
                          onClick={() => onToggleStatus(u.id)}
                        >
                          {u.status === 'active' ? 'إيقاف' : 'تفعيل'}
                        </Button>
                        <Button
                          className={cn(styles['action-btn'], styles['quota-action'])}
                          onClick={() => onRestoreQuota(u.id)}
                          disabled={!u.quota?.canRestore}
                          title={
                            u.quota?.canRestore
                              ? 'تجديد كوتة الإيميلات'
                              : 'التجديد متاح بعد استهلاك الكوتة فقط'
                          }
                        >
                          تجديد
                        </Button>
                        <Button
                          className={cn(styles['action-btn'], styles.danger)}
                          onClick={() => handleDeleteClick(u.id)}
                        >
                          حذف
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && onPageChange && (
              <div className={styles['pagination']}>
                <Button
                  className={styles['page-btn']}
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  السابق
                </Button>
                {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className={styles['ellipsis']}>
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      className={cn(styles['page-btn'], page === currentPage && styles['active'])}
                      onClick={() => onPageChange(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  className={styles['page-btn']}
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}

        {activeUser ? (
          <div className={cn(styles['activity-panel'], styles.open)}>
            <div className={styles['activity-title']}>نشاط - {activeUser.name}</div>
            <div className={styles['activity-row']}>
              <span className={styles['activity-key']}>إجمالي التقديمات</span>
              <span className={styles['activity-val']}>{activeUser.applied}</span>
            </div>
            <div className={styles['activity-row']}>
              <span className={styles['activity-key']}>الوظائف المحفوظة</span>
              <span className={styles['activity-val']}>{activeUser.saved}</span>
            </div>
            <div className={styles['activity-row']}>
              <span className={styles['activity-key']}>تاريخ الانضمام</span>
              <span className={styles['activity-val']}>{activeUser.joined}</span>
            </div>
            <div className={styles['activity-row']}>
              <span className={styles['activity-key']}>الحالة</span>
              <span className={styles['activity-val']}>{getStatusLabel(activeUser.status)}</span>
            </div>
            <div className={styles['activity-row']}>
              <span className={styles['activity-key']}>البريد</span>
              <span className={styles['activity-email']}>{activeUser.email}</span>
            </div>
            {activeUser.quota ? (
              <div className={styles['activity-row']}>
                <span className={styles['activity-key']}>الكوتة</span>
                <span className={styles['activity-val']}>
                  {activeUser.quota.emailsUsedToday}/{activeUser.quota.dailyEmailLimit}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
