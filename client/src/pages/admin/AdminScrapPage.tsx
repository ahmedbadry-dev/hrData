import { useQuery } from '@tanstack/react-query';
import { AdminScraperSection } from '@/components/admin/sections';
import { axiosClient } from '@/services/api';
import { useScraperControl } from '@/modules/admin/hooks/useScraperControl';
import { useScraperLogs, useScraperStatus } from '@/modules/admin/scraper/api/hooks/use-scraper';
import type { AdminScraperStatus, ScraperSourceState } from '@/modules/admin/scraper/api/types';

const DEFAULT_SCRAPER_STATUS: AdminScraperStatus = {
  isRunning: false,
  lastRun: null,
  workerHealthy: false,
  queue: {
    waiting: 0,
    active: 0,
    failed: 0,
    delayed: 0,
    scheduled: 0,
  },
  sources: [],
};

const ACTIVE_SOURCE_STATES = new Set<ScraperSourceState>(['ACTIVE', 'RUNNING', 'NO_DATA']);
const nextRuns = ['09:00 صباحاً', '12:00 منتصف الليل'];

export default function AdminScrapPage() {
  const { startMutation, stopMutation, runNowMutation, resetQueueMutation } = useScraperControl();
  const { data: statusResponse } = useScraperStatus();
  const { data: dbLogsResponse } = useScraperLogs();

  const { data: totalJobs } = useQuery({
    queryKey: ['jobs', 'total-count'],
    queryFn: () => axiosClient.get('/jobs?page=1&limit=1').then((r) => r.data.paginationMeta.total),
    staleTime: 60 * 1000,
  });

  const scraperStatus = statusResponse?.data ?? DEFAULT_SCRAPER_STATUS;
  const activeSources = scraperStatus.sources.filter((source) =>
    ACTIVE_SOURCE_STATES.has(source.state)
  ).length;

  return (
    <AdminScraperSection
      status={scraperStatus}
      totalJobs={totalJobs}
      activeSources={activeSources}
      nextRuns={nextRuns}
      onStart={() => startMutation.mutate()}
      onStop={() => stopMutation.mutate()}
      onRunNow={() => runNowMutation.mutate()}
      onResetQueue={() => resetQueueMutation.mutate()}
      scraperLogs={dbLogsResponse?.data ?? []}
      scraperSources={scraperStatus.sources}
    />
  );
}
