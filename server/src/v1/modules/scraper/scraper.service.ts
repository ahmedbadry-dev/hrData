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
import { SCRAPER_CONSTANTS } from './scraper.constants';

export interface ScraperStatusResponse {
  isRunning: boolean;
  lastRun: string | null;
}

export class ScraperService {
  constructor(private readonly prisma: PrismaClient) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async getStatus(): Promise<ScraperStatusResponse> {
    const [status, lastRunSetting] = await Promise.all([
      redis.get('scraper:status'), // running | paused | stopped
      this.prisma.systemSetting.findUnique({
        where: { key: 'scraper_last_run' },
      }),
    ]);

    return {
      isRunning: status === 'running',
      lastRun: lastRunSetting?.value ?? null,
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
    const states: any[] = ['completed', 'failed', 'delayed', 'wait', 'paused', 'active'];
    for (const state of states) {
      await scraperQueue.clean(0, 1000, state);
    }

    // 3. Stop global scheduler if running
    await clearScraperSchedule();
    await redis.set('scraper:status', 'paused');
  }
}
