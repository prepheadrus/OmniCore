import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MARKETPLACE_SYNC_QUEUE, INVOICE_QUEUE, CARGO_QUEUE } from '../constants/queue.constants';
import { IMarketplaceJobPayload } from '../interfaces/marketplace-job-payload.interface';

@Injectable()
export class CoreQueueService {
  constructor(
    @InjectQueue(MARKETPLACE_SYNC_QUEUE)
    private readonly syncQueue: Queue,
    @InjectQueue(INVOICE_QUEUE)
    private readonly invoiceQueue: Queue,
    @InjectQueue(CARGO_QUEUE)
    private readonly cargoQueue: Queue,
  ) {}

  async addSyncJob(
    jobName: string,
    payload: IMarketplaceJobPayload,
  ): Promise<void> {
    await this.syncQueue.add(jobName, payload, {
      jobId: payload.id,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addInvoiceJob(
    jobName: string,
    payload: any,
  ): Promise<void> {
    await this.invoiceQueue.add(jobName, payload, {
      jobId: payload.id,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addCargoJob(
    jobName: string,
    payload: any,
  ): Promise<void> {
    await this.cargoQueue.add(jobName, payload, {
      jobId: payload.id,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
