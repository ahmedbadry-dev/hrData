import type { SavedJob, UserJob } from '@/components/user/sections/userData';
import { EmptyState, SearchBox, Select } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
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
  country: string;
  onCountryChange: (value: string) => void;
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  showSaveButtons?: boolean;
}

const cityOptions = [
  { value: 'all', label: 'كل المدن' },
  { value: 'riyadh', label: 'الرياض' },
  { value: 'jeddah', label: 'جدة' },
  { value: 'dammam', label: 'الدمام' },
  { value: 'khobar', label: 'الخبر' },
  { value: 'mecca', label: 'مكة المكرمة' },
  { value: 'medina', label: 'المدينة المنورة' },
  { value: 'tabuk', label: 'تبوك' },
];

const timeOptions = [
  { value: 'all', label: 'كل الأوقات' },
  { value: 'day', label: 'آخر ٢٤ ساعة' },
  { value: 'week', label: 'آخر أسبوع' },
  { value: 'month', label: 'آخر شهر' },
];

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
  country,
  onCountryChange,
  timeFilter,
  onTimeFilterChange,
  showSaveButtons = true,
}: UserSearchSectionProps) {
  const visibleJobs = jobs.slice(0, visibleCount);

  const isSaved = (job: UserJob) =>
    savedJobs.some((s: SavedJob) => s.company === job.company && s.role === job.role);

  return (
    <section>
      <div className={styles['search-wrapper']}>
        <span className={styles['search-label']}>البحث عن وظيفة</span>
        <div className={styles['search-flex']}>
          <SearchBox
            value={searchQuery}
            placeholder="مسمى وظيفي، تخصص، مدينة..."
            onChange={onSearchQueryChange}
            onSubmit={onSearch}
            buttonLabel="بحث"
            className={styles['search-box']}
          />
          <Select
            options={cityOptions}
            value={country}
            onValueChange={onCountryChange}
            containerClassName={styles['city-select']}
          />
          <Select
            options={timeOptions}
            value={timeFilter}
            onValueChange={onTimeFilterChange}
            containerClassName={styles['time-select']}
          />
        </div>
      </div>

      {!hasSearched ? (
        <EmptyState
          symbol="◎"
          title="لا توجد نتائج بحث بعد. استخدم مربع البحث أعلاه للعثور على وظيفتك المثالية."
          className={styles['welcome-state']}
          symbolClassName={styles['big-number']}
        />
      ) : (
        <>
          <div className={styles['control-bar']}>
            <span className={styles['count-label']}>عُثر على {jobs.length} وظيفة</span>
            {showSaveButtons && (
              <Button className={styles['save-all-btn']} onClick={onSaveAllVisible}>
                حفظ الكل
              </Button>
            )}
          </div>

          <div className={styles['results-list']}>
            {visibleJobs.map((job) => {
              const key = `${job.company}-${job.role}`;
              const saved = isSaved(job);
              const selected = selectedCard === key;

              return (
                <div
                  className={cn(styles['job-card'], selected && styles.selected)}
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

                    {showSaveButtons && (
                      <Button
                        type="button"
                        variant="icon"
                        className={cn(styles['save-btn'], saved && styles.saved)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(job);
                        }}
                        title={saved ? 'إزالة من المحفوظات' : 'حفظ الوظيفة'}
                      >
                        <svg viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="0.9"
                            d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                          />
                        </svg>
                      </Button>
                    )}
                  </div>

                  <div className={styles['card-email']}>
                    <span className={styles['email-hint']}>أرسل سيرتك إلى</span>
                    <a
                      className={styles['email-link']}
                      href={`mailto:${job.email}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📧 {job.email}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < jobs.length ? (
            <div className={styles['load-more-wrap']}>
              <Button className={styles['btn-load-more']} onClick={onLoadMore}>
                تحميل المزيد
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
