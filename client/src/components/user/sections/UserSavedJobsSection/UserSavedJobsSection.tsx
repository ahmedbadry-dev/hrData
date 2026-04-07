import type { SavedJob } from '@/components/user/sections/userData';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './UserSavedJobsSection.module.css';

interface UserSavedJobsSectionProps {
  savedJobs: SavedJob[];
  onRemoveByIndex: (index: number) => void;
  onRemoveAll: () => void;
}

export default function UserSavedJobsSection({
  savedJobs,
  onRemoveByIndex,
  onRemoveAll,
}: UserSavedJobsSectionProps) {
  if (savedJobs.length === 0) {
    return (
      <section>
        <EmptyState
          symbol="◆"
          title="لا توجد وظائف محفوظة بعد. اضغط على أيقونة الحفظ."
          className={styles['welcome-state']}
          symbolClassName={styles['big-number']}
        />
      </section>
    );
  }

  return (
    <section>
      <div className={styles['saved-header']}>
        <div>
          <div className={styles['section-eyebrow']}>المحفوظة</div>
          <strong>{savedJobs.length} وظيفة</strong>
        </div>

        <Button className={styles['remove-all-btn']} onClick={onRemoveAll}>
          إزالة الكل
        </Button>
      </div>

      <div className={styles['results-list']}>
        {savedJobs.map((job, index) => (
          <div className={styles['job-card']} key={`${job.company}-${job.role}-${index}`}>
            <div className={styles['card-top']}>
              <div className={styles['card-main']}>
                <div className={styles['company-tag']}>{job.company}</div>
                <h2 className={styles['job-title']}>{job.role}</h2>
                <div className={styles['meta-row']}>
                  <span className={styles['meta-chip']}>📍 {job.city}</span>
                  <span className={styles['meta-chip']}>🎓 {job.major}</span>
                  <span className={styles['meta-chip']}>
                    📅 {new Date(job.timestamp).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="icon"
                className={cn(styles['save-btn'], styles.saved)}
                onClick={() => onRemoveByIndex(index)}
              >
                ★
              </Button>
            </div>

            <div className={styles['card-email']}>
              <span className={styles['email-hint']}>أرسل سيرتك إلى</span>
              <a className={styles['email-link']} href={`mailto:${job.email}`}>
                📧 {job.email}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
