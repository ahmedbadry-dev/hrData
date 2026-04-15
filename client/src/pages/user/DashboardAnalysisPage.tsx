import { useState } from 'react';
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
  const { data, isLoading } = useApplicationsList({
    limit: ITEMS_PER_PAGE,
    page,
  });
  const cancelMutation = useCancelApplication();

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
  const totalPages = pagination?.totalPages || 1;

  const handleCancel = (id: string) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذه الطلبات؟')) return;
    cancelMutation.mutate(id);
  };

  return (
    <UserAnalyticsSection
      applications={applications}
      currentPage={page}
      totalPages={totalPages}
      isLoading={isLoading}
      onPageChange={setPage}
      onCancel={handleCancel}
    />
  );
}
