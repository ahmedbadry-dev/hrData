import type { UserApplication } from '@/components/user/sections/userData';
import { EmptyState, PageHeader } from '@/components/common';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getPageNumbers } from '@/lib/pagination';
import { formatCity } from '@/lib/cityMapper';
import { qualificationOptions } from '@/modules/jobs/types/filterOptions';
import styles from './UserAnalyticsSection.module.css';

interface UserAnalyticsSectionProps {
  applications: UserApplication[];
  currentPage?: number;
  totalPages?: number;
  isLoading?: boolean;
  showingLabel?: string;
  onPageChange?: (page: number) => void;
  onCancel?: (id: string) => void;
}

const statusColors: Record<UserApplication['status'], { color: string; text: string }> = {
  pending: { color: '#b8860b', text: 'قيد الإرسال' },
  sent: { color: '#1a6b4a', text: 'تم الإرسال' },
  opened: { color: '#1a6b4a', text: 'تم الفتح' },
  replied: { color: '#1a6b4a', text: 'تم الرد' },
  failed: { color: '#c0392b', text: 'فشل' },
  cancelled: { color: '#6c757d', text: 'ملغي' },
};

const statusPriority: Record<UserApplication['status'], number> = {
  pending: 1,
  replied: 2,
  opened: 2,
  sent: 2,
  failed: 3,
  cancelled: 4,
};

const EMPTY_FIELD_LABEL = 'غير محدد';

const getQualificationLabel = (qualification?: string | null) =>
  qualificationOptions.find((option) => option.value === qualification)?.label || EMPTY_FIELD_LABEL;

const getExperienceIcon = (experience: string) =>
  ['بدون خبرة', 'لا يشترط', 'غير مطلوبة', 'غير مطلوب'].some((phrase) => experience.includes(phrase))
    ? '✨'
    : '💼';

export default function UserAnalyticsSection({
  applications,
  currentPage = 1,
  totalPages = 1,
  isLoading,
  showingLabel,
  onPageChange,
  onCancel,
}: UserAnalyticsSectionProps) {
  const sortedApplications = [...applications].sort((a, b) => {
    const pA = statusPriority[a.status] || 99;
    const pB = statusPriority[b.status] || 99;
    if (pA !== pB) return pA - pB;

    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  if (applications.length === 0) {
    return (
      <section>
        <PageHeader title="التحليلات والتتبع" titleClassName={styles['section-headline']} />
        <EmptyState
          symbol="◐"
          title="لا توجد بيانات تتبع بعد"
          description='استخدم "التقديم الآلي" لإرسال طلباتك ومتابعتها هنا'
          className={styles['welcome-state']}
          symbolClassName={styles['big-number']}
          descriptionClassName={styles.hint}
        />
      </section>
    );
  }

  return (
    <section>
      <PageHeader title="التحليلات والتتبع" titleClassName={styles['section-headline']} />
      <div className={styles['control-bar']}>
        <span className={styles['count-label']}>
          {showingLabel || `${applications.length} طلب مرسل`}
        </span>
      </div>

      <div className={styles['results-list']}>
        {sortedApplications.map((app, index) => {
          const status = statusColors[app.status] ?? statusColors.pending;
          const dateStr = app.date
            ? new Date(app.date).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : new Date().toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
          const experienceText = app.experience?.trim() || EMPTY_FIELD_LABEL;
          const languageRequirementText = app.languageRequirement?.trim() || EMPTY_FIELD_LABEL;
          const descriptionText = app.description?.trim() || 'لا يوجد وصف متاح';
          const categoryText = app.major?.trim() || EMPTY_FIELD_LABEL;

          return (
            <div
              className={styles['job-card']}
              style={{ animationDelay: `${index * 0.08}s` }}
              key={`${app.company}-${app.role}-${app.date}`}
            >
              <div className={styles['card-top']}>
                <div className={styles['card-main']}>
                  <div className={styles['company-tag']}>اسم الجهة: {app.company}</div>
                  <h2 className={styles['job-title']}>{app.role}</h2>
                  <div className={styles['meta-row']}>
                    <span className={styles['meta-chip']}>
                      <span className={styles['meta-icon']} aria-hidden="true">
                        📍
                      </span>
                      <span className={styles['meta-text']}>{formatCity(app.city)}</span>
                    </span>
                    <span className={styles['meta-chip']}>
                      <span className={styles['meta-icon']} aria-hidden="true">
                        🎓
                      </span>
                      <span className={styles['meta-text']}>
                        {getQualificationLabel(app.qualification)}
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
                      <span className={styles['meta-text']}>{dateStr}</span>
                    </span>
                    <span className={cn(styles['meta-chip'], styles['experience-chip'])}>
                      <span className={styles['meta-icon']} aria-hidden="true">
                        {getExperienceIcon(experienceText)}
                      </span>
                      <span className={styles['meta-text']}>{experienceText}</span>
                    </span>
                    <span className={cn(styles['meta-chip'], styles['language-chip'])}>
                      <span className={styles['meta-icon']} aria-hidden="true">
                        🌐
                      </span>
                      <span className={styles['meta-text']}>{languageRequirementText}</span>
                    </span>
                  </div>
                  <div className={styles['job-description']}>
                    <div className={styles['description-label']}>الوصف الوظيفي</div>
                    <p className={styles['description-text']}>{descriptionText}</p>
                  </div>
                </div>

                <div
                  className={styles['status-box']}
                  style={{ background: `${status.color}15`, borderColor: status.color }}
                >
                  <div style={{ color: status.color }}>{status.text}</div>
                </div>

                {onCancel && app.id && app.status === 'pending' && (
                  <button
                    type="button"
                    className={styles['cancel-btn']}
                    onClick={() => onCancel(app.id!)}
                  >
                    إلغاء
                  </button>
                )}
              </div>

              <div className={styles['card-email']}>
                <span className={styles['email-hint']}>أرسلت إلى</span>
                <span className={styles['email-link']}>{app.email}</span>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && onPageChange && (
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
    </section>
  );
}
