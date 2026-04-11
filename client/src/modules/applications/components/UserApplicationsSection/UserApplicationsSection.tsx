import { Spinner } from '@/components/ui';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui';
import { UseApplicationsList, UseCancelApplication } from '../../api/hooks';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '../../types';
import type { ApplicationStatusType } from '../../types';
import styles from './UserApplicationsSection.module.css';

interface UserApplicationsSectionProps {
  statusFilter?: string;
}

export default function UserApplicationsSection({ statusFilter }: UserApplicationsSectionProps) {
  const { data, isLoading, error } = UseApplicationsList({ status: statusFilter });
  const cancelMutation = UseCancelApplication();

  if (isLoading) {
    return (
      <section className={styles.loading}>
        <Spinner />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <EmptyState symbol="!" title="حدث خطأ في تحميل الطلبات" className={styles['error-state']} />
      </section>
    );
  }

  const applications = data?.data?.applications ?? [];
  const pagination = data?.data?.pagination;

  if (applications.length === 0) {
    return (
      <section>
        <EmptyState
          symbol="◆"
          title="لا توجد طلبات توظيف بعد"
          className={styles['welcome-state']}
          symbolClassName={styles['big-number']}
        />
      </section>
    );
  }

  const handleCancel = (id: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذه الطلبات؟')) return;
    cancelMutation.mutate(id);
  };

  return (
    <section>
      <div className={styles['applications-header']}>
        <div>
          <div className={styles['section-eyebrow']}>طلبات التوظيف</div>
          <strong>{pagination?.total ?? applications.length} طلب</strong>
        </div>
      </div>

      <div className={styles['results-list']}>
        {applications.map((application) => (
          <div className={styles['application-card']} key={application.id}>
            <div className={styles['card-top']}>
              <div className={styles['card-main']}>
                <div className={styles['company-tag']}>{application.job.companyName}</div>
                <h2 className={styles['job-title']}>{application.job.title}</h2>
                <div className={styles['meta-row']}>
                  <span className={styles['meta-chip']}>
                    📧 {application.job.hrEmail ?? 'غير محدد'}
                  </span>
                  <span
                    className={styles['status-chip']}
                    style={{
                      color: APPLICATION_STATUS_COLORS[application.status as ApplicationStatusType],
                    }}
                  >
                    {APPLICATION_STATUS_LABELS[application.status as ApplicationStatusType]}
                  </span>
                </div>
              </div>

              {application.status === 'SCHEDULED' && (
                <Button
                  type="button"
                  variant="secondary"
                  className={styles['cancel-btn']}
                  onClick={() => handleCancel(application.id)}
                >
                  إلغاء
                </Button>
              )}
            </div>

            <div className={styles['card-footer']}>
              <div className={styles['timestamps']}>
                {application.scheduledAt && (
                  <span className={styles['timestamp']}>
                    📅 مجدولة: {new Date(application.scheduledAt).toLocaleDateString('ar-SA')}
                  </span>
                )}
                {application.sentAt && (
                  <span className={styles['timestamp']}>
                    ✓ أرسلت: {new Date(application.sentAt).toLocaleDateString('ar-SA')}
                  </span>
                )}
                {application.openedAt && (
                  <span className={styles['timestamp']}>
                    👁 تم الاطلاع: {new Date(application.openedAt).toLocaleDateString('ar-SA')}
                  </span>
                )}
              </div>

              {application.errorMessage && (
                <div className={styles['error-message']}>⚠ {application.errorMessage}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles['pagination']}>
          {pagination.hasPreviousPage && (
            <Button variant="secondary" size="sm">
              السابق
            </Button>
          )}
          <span className={styles['page-info']}>
            صفحة {pagination.page} من {pagination.totalPages}
          </span>
          {pagination.hasNextPage && (
            <Button variant="secondary" size="sm">
              التالي
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
