import { AdminHomeSection } from '@/components/admin/sections';
import { useAdminDashboard } from '@/modules/admin/analytics/api/hooks';
import type { AdminLog } from '@/components/admin/sections/adminData';

const ACTION_COLORS: Record<string, { color: string; typeLabel: string; type: AdminLog['type'] }> =
  {
    LOGIN: { color: '#1a4a8a', typeLabel: 'دخول', type: 'reg' },
    VERIFY_EMAIL: { color: '#1a6b4a', typeLabel: 'تأكيد', type: 'apply' },
    CHANGE_PASSWORD: { color: '#b8860b', typeLabel: 'تغيير', type: 'info' },
    RESET_PASSWORD: { color: '#c0392b', typeLabel: 'استعادة', type: 'error' },
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
  const time = new Date(log.createdAt).toLocaleString('ar-SA');

  const actionText: Record<string, string> = {
    LOGIN: `تسجيل دخول — ${userName}`,
    VERIFY_EMAIL: `تأكيد حساب — ${userName}`,
    CHANGE_PASSWORD: `تغيير كلمة المرور — ${userName}`,
    RESET_PASSWORD: `استعادة كلمة المرور — ${userName}`,
  };

  return {
    type: meta.type,
    text: actionText[log.action] ?? `${log.action} — ${userName}`,
    time,
    typeLabel: meta.typeLabel,
    color: meta.color,
    action: log.action,
  };
}

export default function AdminHomePage() {
  const [overviewRes, loginsRes, logsRes] = useAdminDashboard();

  const overview = overviewRes.data?.data;
  const logins = loginsRes.data?.data;
  const activityLogs = logsRes.data?.data;

  const logs: AdminLog[] = (activityLogs ?? []).map(toAdminLog);

  return <AdminHomeSection stats={overview} loginsData={logins} logs={logs} />;
}
