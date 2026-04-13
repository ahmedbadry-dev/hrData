import { useState } from 'react';
import { UserAnalyticsSection } from '@/components/user/sections';
import { UseApplicationsList, UseCancelApplication } from '@/modules/applications/api/hooks';
import type { Application, ApplicationStatusType } from '@/modules/applications/types';
import type { UserApplication } from '@/components/user/sections/userData';

const ITEMS_PER_PAGE = 10;

const mapStatusToUserApp = (status: ApplicationStatusType): UserApplication['status'] => {
  switch (status) {
    case 'SCHEDULED':
    case 'SENDING':
      return 'pending';
    case 'SENT':
    case 'EMAIL_SENT':
      return 'sent';
    case 'EMAIL_OPENED':
      return 'opened';
    case 'FAILED':
      return 'failed';
    default:
      return 'pending';
  }
};

export default function DashboardAnalysisPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = UseApplicationsList({
    limit: ITEMS_PER_PAGE,
    page,
  });
  const cancelMutation = UseCancelApplication();

  const applications: UserApplication[] = (data?.data?.applications || []).map(
    (app: Application) => ({
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
    })
  );

  const pagination = data?.data?.pagination;
  const hasNextPage = pagination?.hasNextPage || false;

  const handleCancel = (id: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذه الطلبات؟')) return;
    cancelMutation.mutate(id);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <UserAnalyticsSection
      applications={applications}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onLoadMore={handleLoadMore}
      onCancel={handleCancel}
    />
  );
}
