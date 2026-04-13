import { AdminHomeSection } from '@/components/admin/sections';
import {
  useAnalyticsOverview,
  useLoginsPerDay,
  useApplicationsPerDay,
  useEmailErrorsPerDay,
} from '@/modules/admin/analytics/api/hooks';
import type { AdminLog } from '@/components/admin/sections/adminData';

export default function AdminHomePage() {
  const { data: overview } = useAnalyticsOverview();
  const { data: logins } = useLoginsPerDay(7);
  const { data: applications } = useApplicationsPerDay(7);
  const { data: errors } = useEmailErrorsPerDay(7);

  const logs: AdminLog[] = [];

  return (
    <AdminHomeSection
      stats={overview?.data}
      loginsData={logins?.data}
      applicationsData={applications?.data}
      errorsData={errors?.data}
      logs={logs}
    />
  );
}
