import 'dotenv/config';
import { resetAllQueues } from '../src/config/bullmq';

async function run() {
  console.log('🚀 Starting queue reset...');
  try {
    await resetAllQueues();
    console.log('✨ Done!');
  } catch (error) {
    console.error('💥 Error resetting queues:', error);
  } finally {
    process.exit(0);
  }
}

run();
