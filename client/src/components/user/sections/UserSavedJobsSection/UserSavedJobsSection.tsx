import type { SavedJob } from '@/components/user/sections/userData';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/pagination';
import { formatCity, formatCompany } from '@/lib/cityMapper';
import { qualificationOptions } from '@/modules/jobs/types/filterOptions';
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

const EMPTY_FIELD_LABEL = 'غير محدد';

const getQualificationLabel = (qualification?: string | null) =>
  qualificationOptions.find((option) => option.value === qualification)?.label || EMPTY_FIELD_LABEL;

const formatJobDate = (date?: string | null) => {
  if (!date) {
    return EMPTY_FIELD_LABEL;
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getExperienceIcon = (experience: string) =>
  ['بدون خبرة', 'لا يشترط', 'غير مطلوبة', 'غير مطلوب'].some((phrase) => experience.includes(phrase))
    ? '✨'
    : '💼';

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
        {sortedSavedJobs.map((job, index) => {
          const experienceText = job.experience?.trim() || EMPTY_FIELD_LABEL;
          const experienceIcon = getExperienceIcon(experienceText);
          const isNoExperience = experienceIcon === '✨';
          const languageRequirementText = job.languageRequirement?.trim() || EMPTY_FIELD_LABEL;
          const isLanguageNotRequired = ['غير مطلوبة', 'غير مطلوب'].some((phrase) =>
            languageRequirementText.includes(phrase)
          );
          const descriptionText = job.description?.trim() || 'لا يوجد وصف متاح';
          const categoryText = job.major?.trim() || EMPTY_FIELD_LABEL;

          return (
            <div className={styles['job-card']} key={`${job.company}-${job.role}-${index}`}>
              <div className={styles['card-top']}>
                <div className={styles['card-main']}>
                  <div className={styles['company-tag']}>{formatCompany(job.company)}</div>
                  <h2 className={styles['job-title']}>{job.role}</h2>
                  <div className={styles['meta-row']}>
                    <span className={styles['meta-chip']}>
                      <span className={styles['meta-icon']} aria-hidden="true">
                        📍
                      </span>
                      <span className={styles['meta-text']}>{formatCity(job.city)}</span>
                    </span>
                    <span className={styles['meta-chip']}>
                      <span className={styles['meta-icon']} aria-hidden="true">
                        🎓
                      </span>
                      <span className={styles['meta-text']}>
                        {getQualificationLabel(job.qualification)}
                      </span>
                    </span>
                    <span className={styles['meta-chip']}>
                      <span className={styles['meta-icon']} aria-hidden="true">
                        📘
                      </span>
                      <span className={styles['meta-text']}>{categoryText}</span>
                    </span>
                    <span className={styles['meta-chip']}>
                      <span className={styles['meta-icon']} aria-hidden="true">
                        📅
                      </span>
                      <span className={styles['meta-text']}>
                        {formatJobDate(job.date || job.timestamp)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        styles['meta-chip'],
                        styles['experience-chip'],
                        isNoExperience && styles['no-experience-chip']
                      )}
                    >
                      <span className={styles['meta-icon']} aria-hidden="true">
                        {experienceIcon}
                      </span>
                      <span className={styles['meta-text']}>{experienceText}</span>
                    </span>
                    <span
                      className={cn(
                        styles['meta-chip'],
                        isLanguageNotRequired && styles['language-chip']
                      )}
                    >
                      <span className={styles['meta-icon']} aria-hidden="true">
                        🌐
                      </span>
                      <span className={styles['meta-text']}>{languageRequirementText}</span>
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
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </Button>
              </div>

              <div className={styles['job-description']}>
                <div className={styles['description-label']}>الوصف الوظيفي</div>
                <p className={styles['description-text']}>{descriptionText}</p>
              </div>

              <div className={styles['card-email']}>
                <a className={styles['email-link']} href={`mailto:${job.hrEmail || job.email}`}>
                  📧 {job.hrEmail || job.email}
                </a>
                <span className={styles['email-hint']}>أرسل سيرتك إلى</span>
              </div>
            </div>
          );
        })}
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
