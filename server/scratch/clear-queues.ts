import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import 'dotenv/config';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6380');

const connection = new IORedis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
});

async function clearQueues() {
  const queueNames = ['job-scraper', 'job-applications-schedule'];

  console.log('🧹 Starting to clear BullMQ queues...');

  for (const name of queueNames) {
    try {
      const queue = new Queue(name, { connection });

      // Obliterate removes the queue and all its jobs, including metadata
      // If you just want to clear jobs but keep the queue, use drain() or clean()
      // We'll use obliterate to ensure everything is wiped.
      await queue.obliterate({ force: true });

      console.log(`✅ Queue "${name}" has been cleared and obliterated.`);
      await queue.close();
    } catch (error) {
      console.error(`❌ Error clearing queue "${name}":`, error);
    }
  }

  console.log('✨ All targeted queues have been processed.');
  process.exit(0);
}

clearQueues();
