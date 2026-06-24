import { useMemo, useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { EmptyState } from '@/components/common';
import { UserAnalyticsSection } from '@/components/user/sections';
import { useApplicationsList, useCancelApplication } from '@/modules/applications/api/hooks';
import type { Application } from '@/modules/applications/types';
import { ApplicationStatus } from '@/constants/enums';
import type { UserApplication } from '@/components/user/sections/userData';
import styles from './DashboardAnalysisPage.module.css';

const ITEMS_PER_PAGE = 10;

const mapStatusToUserApp = (status: ApplicationStatus): UserApplication['status'] => {
  switch (status) {
    case ApplicationStatus.SCHEDULED:
    case ApplicationStatus.SENDING:
      return 'pending';
    case ApplicationStatus.SENT:
    case ApplicationStatus.EMAIL_SENT:
      return 'sent';
    case ApplicationStatus.EMAIL_OPENED:
      return 'opened';
    case ApplicationStatus.FAILED:
    case ApplicationStatus.EMAIL_FAILED:
      return 'failed';
    case ApplicationStatus.CANCELLED:
      return 'cancelled';
    default:
      return 'pending';
  }
};

export default function DashboardAnalysisPage() {
  const [page, setPage] = useState(1);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const { showToast } = useToast();

  const { data, isLoading, isFetching, isError } = useApplicationsList(
    {
      limit: ITEMS_PER_PAGE,
      page,
    },
    {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  const cancelMutation = useCancelApplication(
    {
      onSuccess: () => {
        showToast({ message: 'تم إلغاء الطلب بنجاح', type: 'success' });
      },
      onError: () => {
        showToast({ message: 'تعذر إلغاء الطلب حالياً. حاول مرة أخرى.', type: 'error' });
      },
    },
    { page, limit: ITEMS_PER_PAGE }
  );

  const applications: UserApplication[] = useMemo(
    () =>
      (data?.data?.applications || []).map((app: Application) => ({
        id: app.id,
        company: app.job?.companyName || '',
        role: app.job?.title || '',
        email: app.job?.hrEmail || '',
        major: app.job?.category || '',
        city: app.job?.location || '',
        description: app.job?.description,
        experience: app.job?.experience,
        qualification: app.job?.qualification,
        specialization: app.job?.specialization,
        date: app.scheduledAt || app.sentAt || null,
        status: mapStatusToUserApp(app.status),
        retryCount: app.retryCount,
        errorMessage: app.errorMessage,
      })),
    [data?.data?.applications]
  );

  const paginationMeta = data?.paginationMeta ?? data?.data?.pagination;
  const totalPages = paginationMeta?.totalPages || 1;
  const totalApplications = paginationMeta?.total || 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const from = totalApplications === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const to = totalApplications === 0 ? 0 : Math.min(page * ITEMS_PER_PAGE, totalApplications);

  const handleCancelClick = (id: string) => {
    setPendingCancelId(id);
  };

  const handleConfirmCancel = () => {
    if (pendingCancelId) {
      cancelMutation.mutate(pendingCancelId);
      setPendingCancelId(null);
    }
  };

  const handleCancelClose = () => {
    setPendingCancelId(null);
  };

  if (isError) {
    return (
      <section>
        <EmptyState
          symbol="!"
          title="تعذر تحميل بيانات التحليلات"
          description="يرجى إعادة المحاولة بعد قليل"
        />
      </section>
    );
  }

  return (
    <>
      {pendingCancelId !== null && (
        <div className={styles['confirm-overlay']} onClick={handleCancelClose}>
          <div className={styles['confirm-dialog']} onClick={(e) => e.stopPropagation()}>
            <p className={styles['confirm-text']}>هل أنت متأكد من إلغاء هذا الطلب؟</p>
            <div className={styles['confirm-actions']}>
              <button className={styles['confirm-btn-cancel']} onClick={handleCancelClose}>
                إلغاء
              </button>
              <button className={styles['confirm-btn-delete']} onClick={handleConfirmCancel}>
                نعم، إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      <UserAnalyticsSection
        applications={applications}
        currentPage={page}
        totalPages={totalPages}
        isLoading={isLoading || isFetching}
        showingLabel={`Showing ${from}-${to} of ${totalApplications} applications`}
        onPageChange={setPage}
        onCancel={handleCancelClick}
      />
    </>
  );
}
