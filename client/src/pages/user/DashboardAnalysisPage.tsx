import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/common';
import { UserAnalyticsSection } from '@/components/user/sections';
import { useApplicationsList, useCancelApplication } from '@/modules/applications/api/hooks';
import type { Application } from '@/modules/applications/types';
import { ApplicationStatus } from '@/constants/enums';
import type { UserApplication } from '@/components/user/sections/userData';

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
    default:
      return 'pending';
  }
};

export default function DashboardAnalysisPage() {
  const [page, setPage] = useState(1);

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

  const cancelMutation = useCancelApplication({
    onError: () => {
      alert('تعذر إلغاء الطلب حالياً. حاول مرة أخرى.');
    },
  });

  const applications: UserApplication[] = useMemo(
    () =>
      (data?.data?.applications || []).map((app: Application) => ({
        id: app.id,
        company: app.job?.companyName || '',
        role: app.job?.title || '',
        email: app.job?.hrEmail || '',
        major: app.job?.category || '',
        city: app.job?.location || '',
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

  const from = totalApplications === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const to = totalApplications === 0 ? 0 : Math.min(page * ITEMS_PER_PAGE, totalApplications);

  const handleCancel = (id: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذه الطلبات؟')) return;
    cancelMutation.mutate(id);
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
    <UserAnalyticsSection
      applications={applications}
      currentPage={page}
      totalPages={totalPages}
      isLoading={isLoading || isFetching}
      showingLabel={`Showing ${from}-${to} of ${totalApplications} applications`}
      onPageChange={setPage}
      onCancel={handleCancel}
    />
  );
}
