import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { scraperQueue, jobApplicationsScheduleQueue, maintenanceQueue } from './bullmq';

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath('/admin/queues');

const bullBoard = createBullBoard({
  queues: [
    new BullMQAdapter(scraperQueue),
    new BullMQAdapter(jobApplicationsScheduleQueue),
    new BullMQAdapter(maintenanceQueue),
  ],
  serverAdapter,
});

export const bullBoardRouter = serverAdapter.getRouter();
