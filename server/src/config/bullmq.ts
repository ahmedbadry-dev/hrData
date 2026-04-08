import { Queue } from 'bullmq';
import { redis } from '@/config/redis';

export const bullmqConnection = { connection: redis };

export const emailSendQueue = new Queue('email-send-queue', bullmqConnection);
export const scraperQueue = new Queue('scraper-queue', bullmqConnection);
