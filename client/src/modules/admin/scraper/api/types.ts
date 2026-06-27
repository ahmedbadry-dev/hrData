export type ScraperSourceState =
  | 'PENDING'
  | 'RUNNING'
  | 'ACTIVE'
  | 'NO_DATA'
  | 'FAILED'
  | 'STALE'
  | 'DISABLED';

export interface ScraperSourceStatus {
  sourceName: string;
  displayName: string;
  type: 'web' | 'api';
  enabled: boolean;
  state: ScraperSourceState;
  runId: string | null;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  linksFound: number;
  jobsScraped: number;
  failureCount: number;
  consecutiveFailureCount: number;
  durationMs: number | null;
  updatedAt: string;
}

export interface ScraperQueueStatus {
  waiting: number;
  active: number;
  failed: number;
  delayed: number;
  scheduled: number;
}

export interface AdminScraperStatus {
  isRunning: boolean;
  lastRun: string | null;
  workerHealthy: boolean;
  queue: ScraperQueueStatus;
  sources: ScraperSourceStatus[];
}
