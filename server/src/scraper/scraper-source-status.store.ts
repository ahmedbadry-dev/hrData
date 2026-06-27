import redis from '@/config/redis';
import logger from '@/shared/utils/logger.util';
import {
  SCRAPER_SOURCE_STATES,
  type ScraperSourceDefinition,
  type ScraperSourceRunResult,
  type ScraperSourceStatus,
  type SiteConfig,
} from './scraper.types';
import { SCRAPER_INTERNAL_CONSTANTS } from './scraper.constants';

const SOURCE_STATUS_KEY_PREFIX = 'scraper:source-status:';
const WORKER_HEARTBEAT_KEY = 'scraper:worker-heartbeat';

const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  ewdifh: 'Ewdifh',
  twitter: 'Twitter',
  wadifh: 'Wadifh',
  linkedksa: 'Linkedksa',
  tabiwazifa: 'Tabiwazifa',
  jbscv: 'Jbscv',
  fu1sa: 'Fu1sa',
  alwzifa: 'Alwzifa',
  jobhuna: 'Jobhuna',
};

const sourceStatusKey = (sourceName: string): string => `${SOURCE_STATUS_KEY_PREFIX}${sourceName}`;

const toSourceDefinition = (site: SiteConfig): ScraperSourceDefinition => ({
  sourceName: site.name,
  displayName: SOURCE_DISPLAY_NAMES[site.name] ?? site.name,
  type: site.type,
});

const buildDefaultStatus = (site: SiteConfig): ScraperSourceStatus => {
  const now = new Date().toISOString();
  return {
    ...toSourceDefinition(site),
    enabled: true,
    state: SCRAPER_SOURCE_STATES.PENDING,
    runId: null,
    lastStartedAt: null,
    lastFinishedAt: null,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastError: null,
    linksFound: 0,
    jobsScraped: 0,
    failureCount: 0,
    consecutiveFailureCount: 0,
    durationMs: null,
    updatedAt: now,
  };
};

const normalizeStatus = (site: SiteConfig, status: ScraperSourceStatus): ScraperSourceStatus => ({
  ...buildDefaultStatus(site),
  ...status,
  ...toSourceDefinition(site),
  enabled: status.enabled ?? true,
});

const safeParseStatus = (site: SiteConfig, raw: string | null): ScraperSourceStatus => {
  if (!raw) return buildDefaultStatus(site);

  try {
    const parsed = JSON.parse(raw) as ScraperSourceStatus;
    return normalizeStatus(site, parsed);
  } catch (error) {
    logger.error(`[ScraperStatus] Failed to parse source status for ${site.name}: ${error}`);
    return buildDefaultStatus(site);
  }
};

const isRunningStatusStale = (status: ScraperSourceStatus, workerHealthy: boolean): boolean => {
  if (status.state !== SCRAPER_SOURCE_STATES.RUNNING || !status.lastStartedAt) return false;
  if (!workerHealthy) return true;

  const startedAt = new Date(status.lastStartedAt).getTime();
  if (Number.isNaN(startedAt)) return false;

  return (
    Date.now() - startedAt > SCRAPER_INTERNAL_CONSTANTS.THRESHOLDS.SOURCE_RUNNING_STALE_AFTER_MS
  );
};

export const scraperSourceStatusStore = {
  async touchWorkerHeartbeat(): Promise<void> {
    try {
      await redis.set(
        WORKER_HEARTBEAT_KEY,
        new Date().toISOString(),
        'EX',
        SCRAPER_INTERNAL_CONSTANTS.EXPIRY.WORKER_HEARTBEAT_TTL_SECONDS
      );
    } catch (error) {
      logger.error(`[ScraperStatus] Failed to write worker heartbeat: ${error}`);
    }
  },

  async isWorkerHealthy(): Promise<boolean> {
    const heartbeat = await redis.get(WORKER_HEARTBEAT_KEY);
    return Boolean(heartbeat);
  },

  async getStatus(site: SiteConfig): Promise<ScraperSourceStatus> {
    const raw = await redis.get(sourceStatusKey(site.name));
    return safeParseStatus(site, raw);
  },

  async getStatuses(sites: SiteConfig[], workerHealthy: boolean): Promise<ScraperSourceStatus[]> {
    const statuses = await Promise.all(sites.map((site) => this.getStatus(site)));

    return statuses.map((status) => {
      if (!isRunningStatusStale(status, workerHealthy)) return status;

      return {
        ...status,
        state: SCRAPER_SOURCE_STATES.STALE,
        lastError: status.lastError ?? 'Source did not finish before the worker heartbeat expired',
      };
    });
  },

  async writeStatus(status: ScraperSourceStatus): Promise<void> {
    try {
      await redis.set(sourceStatusKey(status.sourceName), JSON.stringify(status));
    } catch (error) {
      logger.error(
        `[ScraperStatus] Failed to write source status for ${status.sourceName}: ${error}`
      );
    }
  },

  async markRunning(site: SiteConfig, runId: string): Promise<void> {
    const previous = await this.getStatus(site);
    const now = new Date().toISOString();

    await this.writeStatus({
      ...previous,
      ...toSourceDefinition(site),
      enabled: true,
      state: SCRAPER_SOURCE_STATES.RUNNING,
      runId,
      lastStartedAt: now,
      lastError: null,
      updatedAt: now,
    });
  },

  async markSuccess(site: SiteConfig, result: ScraperSourceRunResult): Promise<void> {
    const previous = await this.getStatus(site);
    const now = new Date().toISOString();
    const state =
      result.linksFound === 0 && result.jobsScraped === 0
        ? SCRAPER_SOURCE_STATES.NO_DATA
        : SCRAPER_SOURCE_STATES.ACTIVE;

    await this.writeStatus({
      ...previous,
      ...toSourceDefinition(site),
      enabled: true,
      state,
      runId: result.runId,
      lastFinishedAt: now,
      lastSuccessAt: now,
      lastError: null,
      linksFound: result.linksFound,
      jobsScraped: result.jobsScraped,
      consecutiveFailureCount: 0,
      durationMs: result.durationMs,
      updatedAt: now,
    });
  },

  async markFailure(
    site: SiteConfig,
    result: ScraperSourceRunResult,
    errorMessage: string
  ): Promise<void> {
    const previous = await this.getStatus(site);
    const now = new Date().toISOString();

    await this.writeStatus({
      ...previous,
      ...toSourceDefinition(site),
      enabled: true,
      state: SCRAPER_SOURCE_STATES.FAILED,
      runId: result.runId,
      lastFinishedAt: now,
      lastFailureAt: now,
      lastError: errorMessage,
      linksFound: result.linksFound,
      jobsScraped: result.jobsScraped,
      failureCount: previous.failureCount + 1,
      consecutiveFailureCount: previous.consecutiveFailureCount + 1,
      durationMs: result.durationMs,
      updatedAt: now,
    });
  },

  async markRunningSourcesStale(sites: SiteConfig[], errorMessage: string): Promise<void> {
    await Promise.all(
      sites.map(async (site) => {
        const previous = await this.getStatus(site);
        if (previous.state !== SCRAPER_SOURCE_STATES.RUNNING) return;

        const now = new Date().toISOString();
        await this.writeStatus({
          ...previous,
          ...toSourceDefinition(site),
          state: SCRAPER_SOURCE_STATES.STALE,
          lastFinishedAt: now,
          lastFailureAt: now,
          lastError: errorMessage,
          consecutiveFailureCount: previous.consecutiveFailureCount + 1,
          updatedAt: now,
        });
      })
    );
  },
};
