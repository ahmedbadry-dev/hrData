import type { AdminUser } from '@/components/admin/sections/adminData';
import { EmptyState, PageHeader, SearchBox } from '@/components/common';
import { Avatar, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
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
  onSearch?: () => void;
  openActivityId: number | null;
}

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
  onSearch,
  openActivityId,
}: AdminUsersSectionProps) {
  const activeUser = users.find((u) => u.id === openActivityId) ?? null;

  return (
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
          بإنتظار التفعيل
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
          symbol="👥"
          title="لا يوجد مستخدمون"
          description="لن تجد مستخدمين بهذا الفلتر"
          className={styles['welcome-state']}
        />
      ) : (
        <>
          <div className={styles['control-bar']}>
            <span className={styles['count-label']}>{users.length} مستخدم</span>
            <span className={styles['helper-label']}>اضغط "نشاط" لتفاصيل المستخدم</span>
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
                        {u.status === 'active'
                          ? 'نشط'
                          : u.status === 'pending_verification'
                            ? 'بانتظار التفعيل'
                            : 'موقوف'}
                      </Badge>
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
                        {u.status === 'active'
                          ? 'إيقاف'
                          : u.status === 'suspended'
                            ? 'تفعيل'
                            : 'تفعيل'}
                      </Button>
                      <Button
                        className={cn(styles['action-btn'], styles.danger)}
                        onClick={() => onDeleteUser(u.id)}
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeUser ? (
        <div className={cn(styles['activity-panel'], styles.open)}>
          <div className={styles['activity-title']}>نشاط — {activeUser.name}</div>
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
            <span className={styles['activity-val']}>
              {activeUser.status === 'active' ? '🟢 نشط' : '🔴 موقوف'}
            </span>
          </div>
          <div className={styles['activity-row']}>
            <span className={styles['activity-key']}>البريد</span>
            <span className={styles['activity-email']}>{activeUser.email}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
