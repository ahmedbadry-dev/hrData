import type { AdminUser } from './adminData';
import styles from './AdminUsersSection.module.css';

interface AdminUsersSectionProps {
  users: AdminUser[];
  searchQuery: string;
  activeFilter: 'all' | 'active' | 'suspended';
  onSearchQueryChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'active' | 'suspended') => void;
  onToggleStatus: (id: number) => void;
  onDeleteUser: (id: number) => void;
  onEditUser: (id: number) => void;
  onToggleActivity: (id: number) => void;
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
  openActivityId,
}: AdminUsersSectionProps) {
  const activeUser = users.find((u) => u.id === openActivityId) ?? null;

  return (
    <section>
      <div className={styles['section-eyebrow']}>الإدارة</div>
      <div className={styles['section-headline']}>إدارة المستخدمين</div>

      <div className={styles['search-box']}>
        <input
          type="text"
          placeholder="ابحث بالاسم أو البريد أو الجوال..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
        <button type="button">بحث</button>
      </div>

      <div className={styles['filter-row']}>
        <button
          className={`${styles['filter-btn']} ${activeFilter === 'all' ? styles.active : ''}`}
          onClick={() => onFilterChange('all')}
        >
          الكل
        </button>
        <button
          className={`${styles['filter-btn']} ${activeFilter === 'active' ? styles.active : ''}`}
          onClick={() => onFilterChange('active')}
        >
          نشط
        </button>
        <button
          className={`${styles['filter-btn']} ${activeFilter === 'suspended' ? styles.active : ''}`}
          onClick={() => onFilterChange('suspended')}
        >
          موقوف
        </button>
      </div>

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
                <td className={styles['id-cell']}>{u.id}</td>
                <td>
                  <div className={styles['user-cell']}>
                    <div className={styles['user-avatar']}>{u.name.charAt(0)}</div>
                    <div>
                      <div className={styles['user-name']}>{u.name}</div>
                      <div className={styles['user-email']}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.phone}>{u.phone}</td>
                <td className={styles.joined}>{u.joined}</td>
                <td>
                  <span className={`${styles['status-badge']} ${styles[u.status]}`}>
                    {u.status === 'active' ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td>
                  <button className={`${styles['action-btn']} ${styles.gold}`} onClick={() => onToggleActivity(u.id)}>
                    نشاط
                  </button>
                  <button className={styles['action-btn']} onClick={() => onEditUser(u.id)}>
                    تعديل
                  </button>
                  <button
                    className={`${styles['action-btn']} ${styles.success}`}
                    onClick={() => onToggleStatus(u.id)}
                  >
                    {u.status === 'active' ? 'إيقاف' : 'تفعيل'}
                  </button>
                  <button
                    className={`${styles['action-btn']} ${styles.danger}`}
                    onClick={() => onDeleteUser(u.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeUser ? (
        <div className={`${styles['activity-panel']} ${styles.open}`}>
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
