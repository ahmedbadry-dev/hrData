import { useOutletContext } from 'react-router-dom';
import { AdminSettingsSection } from '@/components/admin/sections';
import type { AdminDashboardContextType } from './AdminDashboardLayout';

export default function AdminSettingsPage() {
  const { showToast } = useOutletContext<AdminDashboardContextType>();

  return (
    <AdminSettingsSection
      onToggleSetting={(name, enabled) =>
        showToast(`${name}: ${enabled ? 'تم التفعيل' : 'تم التعطيل'}`)
      }
      onSaveEmailSettings={() => showToast('تم حفظ إعدادات البريد')}
      onSaveScraperSettings={() => showToast('تم حفظ الإعداد')}
      onDangerAction={(type) => {
        if (type === 'clear-logs') {
          if (window.confirm('مسح جميع السجلات؟')) showToast('تم مسح السجلات', 'error');
          return;
        }
        if (window.confirm('إعادة الضبط؟')) showToast('تمت إعادة الضبط', 'error');
      }}
    />
  );
}
