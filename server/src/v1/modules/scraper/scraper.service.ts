// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/v1/modules/scraper/scraper.service.ts

// (start / stop / status / run-now)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { PrismaClient } from '@prisma/client';
import { ConflictException } from '@/shared/errors/ConflictException';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import redis from '@/config/redis';
import { scraperQueue } from '@/config/bullmq';
import { startScraperSchedule, clearScraperSchedule } from '@/scraper/scraper.scheduler';
import { SITES_CONFIG } from '@/scraper/scraper.config';
import { scraperSourceStatusStore } from '@/scraper/scraper-source-status.store';
import type { ScraperSourceStatus } from '@/scraper/scraper.types';
import { SCRAPER_CONSTANTS } from './scraper.constants';

export interface ScraperQueueStatus {
  waiting: number;
  active: number;
  failed: number;
  delayed: number;
  scheduled: number;
}

export interface ScraperStatusResponse {
  isRunning: boolean;
  lastRun: string | null;
  workerHealthy: boolean;
  queue: ScraperQueueStatus;
  sources: ScraperSourceStatus[];
}

export class ScraperService {
  constructor(private readonly prisma: PrismaClient) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async getStatus(): Promise<ScraperStatusResponse> {
    const [status, lastRunSetting, workerHealthy, waiting, active, failed, delayed, schedulers] =
      await Promise.all([
        redis.get('scraper:status'), // running | paused | stopped
        this.prisma.systemSetting.findUnique({
          where: { key: 'scraper_last_run' },
        }),
        scraperSourceStatusStore.isWorkerHealthy(),
        scraperQueue.getWaitingCount(),
        scraperQueue.getActiveCount(),
        scraperQueue.getFailedCount(),
        scraperQueue.getDelayedCount(),
        scraperQueue.getJobSchedulers(),
      ]);
    const sources = await scraperSourceStatusStore.getStatuses(SITES_CONFIG, workerHealthy);
    const latestSourceRun = sources.reduce<string | null>((latest, source) => {
      if (!source.lastStartedAt) return latest;
      if (!latest) return source.lastStartedAt;
      return new Date(source.lastStartedAt).getTime() > new Date(latest).getTime()
        ? source.lastStartedAt
        : latest;
    }, null);

    return {
      isRunning: status === 'running',
      lastRun: latestSourceRun ?? lastRunSetting?.value ?? null,
      workerHealthy,
      queue: {
        waiting,
        active,
        failed,
        delayed,
        scheduled: schedulers.length,
      },
      sources,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async start(): Promise<void> {
    const currentStatus = await redis.get('scraper:status');

    if (currentStatus === 'running') {
      throw new ConflictException(SCRAPER_CONSTANTS.MESSAGES.ALREADY_RUNNING);
    }

    await startScraperSchedule();

    // Record last run time in SystemSetting
    await this.prisma.systemSetting.upsert({
      where: { key: 'scraper_last_run' },
      update: { value: new Date().toISOString() },
      create: { key: 'scraper_last_run', value: new Date().toISOString() },
    });

    await redis.set('scraper:status', 'running');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async stop(): Promise<void> {
    const currentStatus = await redis.get('scraper:status');

    if (currentStatus !== 'running') {
      throw new BadRequestException(SCRAPER_CONSTANTS.MESSAGES.NOT_RUNNING);
    }

    await clearScraperSchedule();
    await redis.set('scraper:status', 'paused');
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async runNow(): Promise<void> {
    await scraperQueue.add('run-scraper-manual', {}, { priority: 1 });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async getScrapedLogs() {
    return this.prisma.scrapedLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async resetQueue(): Promise<void> {
    // 1. Drain the queue (removes all waiting and delayed jobs)
    await scraperQueue.drain();

    // 2. Clean various job states
    const states = ['completed', 'failed', 'delayed', 'wait', 'paused', 'active'] as const;
    for (const state of states) {
      await scraperQueue.clean(0, 1000, state);
    }

    // 3. Stop global scheduler if running
    await clearScraperSchedule();
    await redis.set('scraper:status', 'paused');
    await scraperSourceStatusStore.markRunningSourcesStale(
      SITES_CONFIG,
      'Queue reset before this source finished'
    );
  }
}
