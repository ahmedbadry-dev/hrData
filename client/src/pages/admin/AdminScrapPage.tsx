import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/services/api';
import { AdminScraperSection } from '@/components/admin/sections';
import { useScraperControl } from '@/modules/admin/hooks/useScraperControl';

export default function AdminScrapPage() {
  const { startMutation, stopMutation, runNowMutation } = useScraperControl();

  const { data: statusResponse } = useQuery({
    queryKey: ['admin', 'scraper-status'],
    queryFn: () => axiosClient.get('/admin/scraper/status').then((r) => r.data),
    refetchInterval: 5000,
  });

  const { data: totalJobs } = useQuery({
    queryKey: ['jobs', 'total-count'],
    queryFn: () => axiosClient.get('/jobs?page=1&limit=1').then((r) => r.data.paginationMeta.total),
    staleTime: 60 * 1000,
  });

  // "المصادر النشطة" — hardcoded 10
  const activeSources = 10;

  // "التشغيل القادم" — hardcoded times
  const nextRuns = ['09:00 صباحاً', '12:00 مساءً'];

  const scraperSources = [
    'ewdifh',
    'wadifh',
    'linkedksa',
    'tabiwazifa',
    'jbscv',
    'fu1sa',
    'alwzifa',
    'jobhuna',
    'awamirtawzif',
    'X',
  ];

  return (
    <AdminScraperSection
      status={statusResponse?.data ?? { isRunning: false, lastRun: null }}
      totalJobs={totalJobs}
      activeSources={activeSources}
      nextRuns={nextRuns}
      onStart={() => startMutation.mutate()}
      onStop={() => stopMutation.mutate()}
      onRunNow={() => runNowMutation.mutate()}
      scraperLogs={[]} // We will handle logs separately if needed, but for now empty
      onClearLog={() => {}}
      onExportLog={() => {}}
      scraperSources={scraperSources}
    />
  );
}
