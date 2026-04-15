import { AdminHomeSection } from '@/components/admin/sections';
import {
  useAnalyticsOverview,
  useLoginsPerDay,
  useApplicationsPerDay,
  useEmailErrorsPerDay,
  useRecentActivityLogs,
} from '@/modules/admin/analytics/api/hooks';
import type { AdminLog } from '@/components/admin/sections/adminData';

const ACTION_COLORS: Record<string, { color: string; typeLabel: string; type: AdminLog['type'] }> =
  {
    USER_REGISTERED: { color: '#1a4a8a', typeLabel: 'تسجيل', type: 'reg' },
    USER_LOGIN: { color: '#1a4a8a', typeLabel: 'دخول', type: 'reg' },
    JOB_APPLICATION_SENT: { color: '#1a6b4a', typeLabel: 'تقديم', type: 'apply' },
    JOB_SAVED: { color: '#b8860b', typeLabel: 'حفظ', type: 'info' },
    EMAIL_SENT: { color: '#1a6b4a', typeLabel: 'إرسال', type: 'apply' },
    EMAIL_FAILED: { color: '#c0392b', typeLabel: 'خطأ', type: 'error' },
  };

function toAdminLog(log: {
  action: string;
  user: { firstName: string; lastName: string } | null;
  createdAt: string;
}): AdminLog {
  const meta = ACTION_COLORS[log.action] ?? {
    color: '#666',
    typeLabel: 'نظام',
    type: 'info' as const,
  };
  const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'النظام';
  const time = new Date(log.createdAt).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const actionText: Record<string, string> = {
    USER_REGISTERED: `تسجيل مستخدم جديد — ${userName}`,
    USER_LOGIN: `دخول مستخدم — ${userName}`,
    JOB_APPLICATION_SENT: `تقديم آلي — ${userName}`,
    JOB_SAVED: `حفظ وظيفة — ${userName}`,
    EMAIL_SENT: `إرسال بريد — ${userName}`,
    EMAIL_FAILED: `فشل إرسال بريد — ${userName}`,
  };

  return {
    type: meta.type,
    text: actionText[log.action] ?? `${log.action} — ${userName}`,
    time,
    typeLabel: meta.typeLabel,
    color: meta.color,
  };
}

export default function AdminHomePage() {
  const { data: overview } = useAnalyticsOverview();
  const { data: logins } = useLoginsPerDay(7);
  const { data: applications } = useApplicationsPerDay(7);
  const { data: errors } = useEmailErrorsPerDay(7);
  const { data: activityLogs } = useRecentActivityLogs();

  const logs: AdminLog[] = (activityLogs?.data ?? []).map(toAdminLog);

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
