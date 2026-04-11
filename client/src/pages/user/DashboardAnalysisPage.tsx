import { useOutletContext } from 'react-router-dom';
import { UserAnalyticsSection } from '@/components/user/sections';
import { UseApplicationsList } from '@/modules/applications/api/hooks';
import type { Application, ApplicationStatusType } from '@/modules/applications/types';
import type { DashboardContextType } from './UserDashboardLayout';
import type { UserApplication } from '@/components/user/sections/userData';

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
  useOutletContext<DashboardContextType>();

  const { data: applicationsData } = UseApplicationsList({ limit: 100 });

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return new Date().toLocaleDateString('ar-SA');
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return new Date().toLocaleDateString('ar-SA');
    return date.toLocaleDateString('ar-SA');
  };

  const applications: UserApplication[] = (applicationsData?.data?.applications || []).map(
    (app: Application) => ({
      company: app.job?.companyName || '',
      role: app.job?.title || '',
      email: app.job?.hrEmail || '',
      major: app.job?.category || '',
      city: app.job?.location || '',
      date: formatDate(app.scheduledAt),
      status: mapStatusToUserApp(app.status),
    })
  );

  return <UserAnalyticsSection applications={applications} />;
}
