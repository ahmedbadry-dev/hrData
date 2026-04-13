import { UserAnalyticsSection } from '@/components/user/sections';
import {
  UseApplicationsListInfinite,
  UseCancelApplication,
} from '@/modules/applications/api/hooks';
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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = UseApplicationsListInfinite({
    limit: ITEMS_PER_PAGE,
  });
  const cancelMutation = UseCancelApplication();

  const applications: UserApplication[] = (
    data?.pages.flatMap((page) => page.data?.applications || []) || []
  ).map((app: Application) => ({
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
  }));

  const handleCancel = (id: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذه الطلبات؟')) return;
    cancelMutation.mutate(id);
  };

  return (
    <UserAnalyticsSection
      applications={applications}
      hasNextPage={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      onLoadMore={fetchNextPage}
      onCancel={handleCancel}
    />
  );
}
