import 'dotenv/config';
import app from './app';
import { appConfig, getEnvVarAsNumber } from './config/env.config';
import logger from '@/shared/utils/logger.util';
import prisma from './config/db.config';
import { bootstrapScraper } from './scraper';
import '@/workers/email-send.worker';

const PORT = getEnvVarAsNumber('PORT', 5000);

process.on('uncaughtException', (err: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION — shutting down', {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
      logger.info(`📊 Health check available at http://localhost:${PORT}/api/v1/health`);
      logger.info(`🌍 Environment: ${appConfig.nodeEnv}`);
      bootstrapScraper();
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

    process.on('unhandledRejection', (reason: Error) => {
      logger.error('💥 UNHANDLED REJECTION — shutting down', { reason });
      server.close(async () => {
        logger.info('👋 UNHANDLED REJECTION — shutting down gracefully');
        await prisma.$disconnect();
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM received — shutting down gracefully');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('✅ DB disconnected. Process terminated.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('👋 SIGINT received — shutting down gracefully');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('✅ Process exited cleanly.');
        process.exit(0);
      });
    });
  } catch (error) {
    await prisma.$disconnect();
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
