// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/main.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import app from './app';
import { appConfig, getEnvVarAsNumber } from './config/env.config';
import logger from '@/shared/utils/logger.util';
import prisma from './config/db.config';
import redis from './config/redis';
import { notificationsService } from './notifications/notifications.service';
import { SettingsService } from './v1/modules/settings/settings.service';

import { jobApplicationsScheduleWorker } from '@/workers/job-applications-schedule.worker';
import { scraperWorker } from '@/workers/scraper.worker';
import { maintenanceWorker, startMaintenanceSchedule } from '@/workers/maintenance.worker';

import { startScraperSchedule } from './scraper/scraper.scheduler';

process.on('uncaughtException', (err: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION — shutting down', {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason: Error) => {
  logger.error('💥 UNHANDLED REJECTION — shutting down', { reason });
  process.exit(1);
});

const PORT = getEnvVarAsNumber('PORT', 5000);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// bootstrapScraper

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function bootstrapScraper(): Promise<void> {
  try {
    await redis.del('scraper:is-running');
    const scraperStatus = await redis.get('scraper:status');

    if (scraperStatus === 'running') {
      await startScraperSchedule();
      logger.info(
        '[Main] ♻️ Scraper scheduled successfully after restart (and queue restored with all new jobs)'
      );
    } else {
      logger.info('[Main] ℹ️ Scraper is stopped — skipping schedule restore');
    }
  } catch (error) {
    logger.error(`[Main] ⚠️ Scraper bootstrap failed: ${error}`);
  }
}

const startServer = async () => {
  try {
    await bootstrapScraper();
    await startMaintenanceSchedule();

    const server = app.listen(PORT, async () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
      logger.info(`📊 Health check available at http://localhost:${PORT}/api/v1/health`);
      logger.info(`🌍 Environment: ${appConfig.nodeEnv}`);


    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please choose a different port.`);
      } else {
        logger.error('Server error:', error);
      }
      server.close(async () => {
        logger.info('👋 Server error — shutting down gracefully');
        await prisma.$disconnect();
        process.exit(1);
      });
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`👋 ${signal} received — shutting down gracefully`);
      server.close(async () => {
        try {
          await Promise.all([
            jobApplicationsScheduleWorker.close(),
            scraperWorker.close(),
            maintenanceWorker.close(),
            prisma.$disconnect(),
          ]);
          logger.info('✅ All workers and DB disconnected. Process terminated.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during graceful shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    await prisma.$disconnect();
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
