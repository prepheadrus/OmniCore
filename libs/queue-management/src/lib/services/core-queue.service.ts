import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MARKETPLACE_SYNC_QUEUE, INVOICE_QUEUE, CARGO_QUEUE, REPRICER_QUEUE } from '../constants/queue.constants';

@Injectable()
export class CoreQueueService {
  constructor(
    @InjectQueue(MARKETPLACE_SYNC_QUEUE)
    private readonly syncQueue: Queue,
    @InjectQueue(INVOICE_QUEUE)
    private readonly invoiceQueue: Queue,
    @InjectQueue(CARGO_QUEUE)
    private readonly cargoQueue: Queue,
    @InjectQueue(REPRICER_QUEUE)
    private readonly repricerQueue: Queue,
  ) {}

  async addSyncJob(
    jobName: string,
    payload: any,
    jobId: string,
  ): Promise<void> {
    await this.syncQueue.add(jobName, payload, {
      jobId: jobId,
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
    jobId: string,
  ): Promise<void> {
    await this.invoiceQueue.add(jobName, payload, {
      jobId: jobId,
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
    jobId: string,
  ): Promise<void> {
    await this.cargoQueue.add(jobName, payload, {
      jobId: jobId,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addRepricerJob(
    jobName: string,
    payload: any,
    jobId: string,
  ): Promise<void> {
    await this.repricerQueue.add(jobName, payload, {
      jobId: jobId,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
