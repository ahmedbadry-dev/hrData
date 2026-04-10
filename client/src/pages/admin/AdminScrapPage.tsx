import { useOutletContext } from 'react-router-dom';
import { AdminScraperSection } from '@/components/admin/sections';
import type { AdminDashboardContextType } from './AdminDashboardLayout';

export default function AdminScrapPage() {
  const {
    scraperRunning,
    scraperLogs,
    savedToken,
    tokenVisible,
    saveToken,
    toggleTokenVisibility,
    toggleScraper,
    clearLogs,
    exportLogs,
  } = useOutletContext<AdminDashboardContextType>();

  return (
    <AdminScraperSection
      scraperRunning={scraperRunning}
      scraperLogs={scraperLogs}
      savedToken={savedToken}
      tokenVisible={tokenVisible}
      onSaveToken={saveToken}
      onToggleTokenVisibility={toggleTokenVisibility}
      onToggleScraper={toggleScraper}
      onClearLog={clearLogs}
      onExportLog={exportLogs}
    />
  );
}
