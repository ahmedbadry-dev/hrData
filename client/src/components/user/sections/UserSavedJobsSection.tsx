import type { SavedJob } from './userData';
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
        <div className={styles['welcome-state']}>
          <div className={styles['big-number']}>◆</div>
          <p>لا توجد وظائف محفوظة بعد. اضغط على أيقونة الحفظ.</p>
        </div>
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

        <button className={styles['remove-all-btn']} onClick={onRemoveAll}>
          إزالة الكل
        </button>
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

              <button className={`${styles['save-btn']} ${styles.saved}`} onClick={() => onRemoveByIndex(index)}>
                ★
              </button>
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
