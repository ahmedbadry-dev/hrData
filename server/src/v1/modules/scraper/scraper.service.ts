// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/v1/modules/scraper/scraper.service.ts

// (start / stop / status / run-now)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { ConflictException } from '@/shared/errors/ConflictException';
import { BadRequestException } from '@/shared/errors/BadRequestException';
import redis from '@/config/redis';
import { scraperQueue } from '@/config/bullmq';
import { startScraperSchedule, clearScraperSchedule } from '@/scraper/scraper.scheduler';
import { SCRAPER_CONSTANTS } from './scraper.constants';


export interface ScraperStatusResponse {
  status: string;
  isCurrentlyRunning: boolean;
  scheduledJobs: number;
  queue: {
    waiting: number;
    active: number;
    failed: number;
  };
}

export class ScraperService {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async getStatus(): Promise<ScraperStatusResponse> {

    const [status, isRunning, repeatableJobs, waiting, active, failed] = await Promise.all([
      redis.get('scraper:status'),       // running | paused | stopped
      redis.get('scraper:is-running'),   
      scraperQueue.getJobSchedulers(),  
      scraperQueue.getWaitingCount(),    
      scraperQueue.getActiveCount(),     
      scraperQueue.getFailedCount(),     
    ]);

    return {
      status: status ?? 'stopped',
      isCurrentlyRunning: isRunning === 'true',
      scheduledJobs: repeatableJobs.length,
      queue: { waiting, active, failed },
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
    await scraperQueue.add(
      'run-scraper-manual',
      {},
      { priority: 1 } 
    );
  }
}