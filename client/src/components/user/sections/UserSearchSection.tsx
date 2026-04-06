import type { SavedJob, UserJob } from './userData';
import styles from './UserSearchSection.module.css';

interface UserSearchSectionProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  jobs: UserJob[];
  visibleCount: number;
  hasSearched: boolean;
  selectedCard: string | null;
  onSelectCard: (key: string) => void;
  onLoadMore: () => void;
  savedJobs: SavedJob[];
  onToggleSave: (job: UserJob) => void;
  onSaveAllVisible: () => void;
}

export default function UserSearchSection({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  jobs,
  visibleCount,
  hasSearched,
  selectedCard,
  onSelectCard,
  onLoadMore,
  savedJobs,
  onToggleSave,
  onSaveAllVisible,
}: UserSearchSectionProps) {
  const visibleJobs = jobs.slice(0, visibleCount);

  const isSaved = (job: UserJob) =>
    savedJobs.some((s) => s.company === job.company && s.role === job.role);

  return (
    <section>
      <div className={styles['search-wrapper']}>
        <span className={styles['search-label']}>البحث عن وظيفة</span>
        <div className={styles['search-box']}>
          <input
            type="text"
            placeholder="مسمى وظيفي، تخصص، مدينة..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
          <button onClick={onSearch}>بحث</button>
        </div>
      </div>

      {!hasSearched ? (
        <div className={styles['welcome-state']}>
          <div className={styles['big-number']}>◎</div>
          <p>لا توجد نتائج بحث بعد. استخدم مربع البحث أعلاه للعثور على وظيفتك المثالية.</p>
        </div>
      ) : (
        <>
          <div className={styles['control-bar']}>
            <span className={styles['count-label']}>عُثر على {jobs.length} وظيفة</span>
            <button className={styles['save-all-btn']} onClick={onSaveAllVisible}>
              حفظ الكل
            </button>
          </div>

          <div className={styles['results-list']}>
            {visibleJobs.map((job) => {
              const key = `${job.company}-${job.role}`;
              const saved = isSaved(job);
              const selected = selectedCard === key;

              return (
                <div
                  className={`${styles['job-card']} ${selected ? styles.selected : ''}`}
                  key={key}
                  onClick={() => onSelectCard(key)}
                >
                  <div className={styles['card-top']}>
                    <div className={styles['card-main']}>
                      <div className={styles['company-tag']}>{job.company}</div>
                      <h2 className={styles['job-title']}>{job.role}</h2>
                      <div className={styles['meta-row']}>
                        <span className={styles['meta-chip']}>📍 {job.city}</span>
                        <span className={styles['meta-chip']}>🎓 {job.major}</span>
                        <span className={styles['meta-chip']}>📅 {job.date}</span>
                      </div>
                    </div>

                    <button
                      className={`${styles['save-btn']} ${saved ? styles.saved : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(job);
                      }}
                      title={saved ? 'إزالة من المحفوظات' : 'حفظ الوظيفة'}
                    >
                      ★
                    </button>
                  </div>

                  <div className={styles['card-email']}>
                    <span className={styles['email-hint']}>أرسل سيرتك إلى</span>
                    <a className={styles['email-link']} href={`mailto:${job.email}`} onClick={(e) => e.stopPropagation()}>
                      📧 {job.email}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < jobs.length ? (
            <div className={styles['load-more-wrap']}>
              <button className={styles['btn-load-more']} onClick={onLoadMore}>
                تحميل المزيد
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
