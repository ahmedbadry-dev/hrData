import type { AdminAnnouncement } from './adminData';
import styles from './AdminAnnouncementsSection.module.css';

interface AdminAnnouncementsSectionProps {
  announcements: AdminAnnouncement[];
  onDelete: (id: number) => void;
  onOpenCreate: () => void;
}

const typeLabels: Record<AdminAnnouncement['type'], string> = {
  info: 'معلوماتي',
  warn: 'تحذير',
  success: 'نجاح',
  danger: 'تنبيه',
};

export default function AdminAnnouncementsSection({
  announcements,
  onDelete,
  onOpenCreate,
}: AdminAnnouncementsSectionProps) {
  return (
    <section>
      <div className={styles['section-eyebrow']}>الإدارة</div>
      <div className={styles['section-headline']}>الإشعارات والإعلانات</div>

      <div className={styles['announce-top']}> 
        <span className={styles['announce-count']}>{announcements.length} إشعار / إعلان</span>
        <button className={styles['btn-primary']} onClick={onOpenCreate}>
          + إرسال إشعار جديد
        </button>
      </div>

      <div>
        {announcements.map((a, i) => (
          <div className={`${styles['announce-card']} ${styles[a.type]}`} style={{ animationDelay: `${i * 0.07}s` }} key={a.id}>
            <div className={styles['announce-head']}>
              <div>
                <div className={styles['announce-title']}>{a.title}</div>
                <div className={styles['announce-meta']}>
                  {a.target} · {a.date}
                </div>
              </div>

              <div className={styles['announce-actions']}>
                <span className={styles['type-badge']}>{typeLabels[a.type]}</span>
                <button className={`${styles['action-btn']} ${styles.danger}`} onClick={() => onDelete(a.id)}>
                  حذف
                </button>
              </div>
            </div>

            <div className={styles['announce-body']}>{a.body}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
