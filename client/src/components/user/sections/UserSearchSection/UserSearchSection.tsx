import type { SavedJob } from '@/components/user/sections/userData';
import type { UserJob } from '@/modules/jobs/types';
import { EmptyState, SearchBox, Select } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/pagination';
import styles from './UserSearchSection.module.css';

interface UserSearchSectionProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  jobs: UserJob[];
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
  hasSearched: boolean;
  selectedCard: string | null;
  onSelectCard: (key: string) => void;
  onPageChange: (page: number) => void;
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
  { value: '', label: 'الكل' },
  { value: 'RIYADH', label: 'الرياض' },
  { value: 'JEDDAH', label: 'جدة' },
  { value: 'DAMMAM', label: 'الدمام' },
  { value: 'KHOBAR', label: 'الخبر' },
  { value: 'MECCA', label: 'مكة' },
  { value: 'MEDINA', label: 'المدينة' },
  { value: 'TABUK', label: 'تبوك' },
];

const timeOptions = [
  { value: '', label: 'الكل' },
  { value: 'DAY', label: 'اليوم' },
  { value: 'WEEK', label: 'هذا الأسبوع' },
  { value: 'MONTH', label: 'هذا الشهر' },
];

const SKELETON_CARDS_COUNT = 4;

export default function UserSearchSection({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  jobs,
  currentPage = 1,
  totalPages = 1,
  isLoading,
  hasSearched,
  selectedCard,
  onSelectCard,
  onPageChange,
  savedJobs,
  onToggleSave,
  onSaveAllVisible,
  country,
  onCountryChange,
  timeFilter,
  onTimeFilterChange,
  showSaveButtons = true,
}: UserSearchSectionProps) {
  const isSaved = (job: UserJob) =>
    savedJobs.some(
      (s: SavedJob) =>
        (job.jobId && s.jobId === job.jobId) || (s.company === job.company && s.role === job.role)
    );

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
      ) : isLoading ? (
        <>
          <div className={styles['control-bar']}>
            <span className={styles['count-label']}>جاري التحميل...</span>
          </div>

          <div className={styles['results-list']}>
            {Array.from({ length: SKELETON_CARDS_COUNT }, (_, index) => (
              <div
                key={`skeleton-${index}`}
                className={styles['skeleton-card']}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className={styles['sk-line']} style={{ width: '22%' }} />
                <div className={styles['sk-line']} style={{ width: '65%', height: '18px' }} />
                <div className={styles['sk-line']} style={{ width: '45%' }} />
                <div className={styles['sk-line']} style={{ marginTop: '18px', height: '36px' }} />
              </div>
            ))}
          </div>
        </>
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
            {jobs.map((job) => {
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
                        <span className={styles['meta-chip']}>
                          📅{' '}
                          {job.date
                            ? new Date(job.date).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : ''}
                        </span>
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

          {totalPages > 1 && (
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
    </section>
  );
}
