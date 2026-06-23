import type { SavedJob } from '@/components/user/sections/userData';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/pagination';
import { formatCity, formatCompany } from '@/lib/cityMapper';
import styles from './UserSavedJobsSection.module.css';
import searchStyles from '../UserSearchSection/UserSearchSection.module.css';

interface UserSavedJobsSectionProps {
  savedJobs: SavedJob[];
  onRemoveByIndex: (index: number) => void;
  onRemoveAll: () => void;
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

export default function UserSavedJobsSection({
  savedJobs,
  onRemoveByIndex,
  onRemoveAll,
  currentPage = 1,
  totalPages = 1,
  isLoading,
  onPageChange,
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

  const sortedSavedJobs = [...savedJobs].sort((a, b) => {
    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return dateB - dateA;
  });

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
        {sortedSavedJobs.map((job, index) => (
          <div className={styles['job-card']} key={`${job.company}-${job.role}-${index}`}>
            <div className={styles['card-top']}>
              <div className={styles['card-main']}>
                <div className={styles['company-tag']}>اسم الجهة: {formatCompany(job.company)}</div>
                <h2 className={styles['job-title']}>{job.role}</h2>
                <div className={styles['meta-row']}>
                  <span className={styles['meta-chip']}>📍 {formatCity(job.city)}</span>
                  <span className={styles['meta-chip']}>🎓 {job.major}</span>
                  <span className={styles['meta-chip']}>
                    الخبرة: {job.experience || 'غير محدد'}
                  </span>
                  <span className={styles['meta-chip']}>
                    📅{' '}
                    {new Date(job.timestamp).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="icon"
                className={cn(styles['save-btn'], styles.saved)}
                onClick={() => onRemoveByIndex(index)}
                title="إزالة من المحفوظات"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
                </svg>
              </Button>
            </div>

            <div className={styles['card-email']}>
              <a className={styles['email-link']} href={`mailto:${job.hrEmail || job.email}`}>
                📧 {job.hrEmail || job.email}
              </a>
              <span className={styles['email-hint']}>أرسل سيرتك إلى</span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className={searchStyles['pagination']}>
          <Button
            className={searchStyles['page-btn']}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            السابق
          </Button>
          {getPageNumbers(currentPage, totalPages).map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className={searchStyles['ellipsis']}>
                ...
              </span>
            ) : (
              <Button
                key={page}
                className={cn(
                  searchStyles['page-btn'],
                  page === currentPage && searchStyles['active']
                )}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
              >
                {page}
              </Button>
            )
          )}
          <Button
            className={searchStyles['page-btn']}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            التالي
          </Button>
        </div>
      )}
    </section>
  );
}
