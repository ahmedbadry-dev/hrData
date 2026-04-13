import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { scraperQueue, jobApplicationsScheduleQueue } from './bullmq';

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath('/admin/queues');

const bullBoard = createBullBoard({
  queues: [new BullMQAdapter(scraperQueue), new BullMQAdapter(jobApplicationsScheduleQueue)],
  serverAdapter,
});

export const bullBoardRouter = serverAdapter.getRouter();
