import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MARKETPLACE_SYNC_QUEUE, JobTypes } from '../constants/queue.constants';
import { IMarketplaceJobPayload } from '../interfaces/marketplace-job-payload.interface';
import { MarketplaceValidationException } from '@omnicore/marketplace-adapters';
import { isAxiosError } from 'axios';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';

@Processor(MARKETPLACE_SYNC_QUEUE, {
  limiter: {
    max: 1000,
    duration: 60000,
  },
})
export class MarketplaceSyncWorker extends WorkerHost {
  private readonly logger = new Logger(MarketplaceSyncWorker.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly clsService: ClsService,
  ) {
    super();
  }

  async process(job: Job<IMarketplaceJobPayload>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      const { channelId, type, payload } = job.data as any;

      if (!channelId) {
        throw new UnrecoverableError(`Job ${job.id} is missing channelId.`);
      }

      await this.clsService.runWith({} as any, async () => {
        this.clsService.set('app.channel_id', channelId);
        if (job.name === JobTypes.SYNC_ORDER && type === JobTypes.SYNC_ORDER) {
          const order = payload;

          await this.databaseService.client.order.upsert({
            where: { orderNumber: order.orderNumber },
            create: {
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
              status: order.status,
              channelId: channelId,
              createdAt: order.createdAt,
            },
            update: {
              status: order.status,
              totalAmount: order.totalAmount,
              updatedAt: new Date(),
            },
          });

          this.logger.log(`Successfully upserted order ${order.orderNumber} for channel ${channelId}`);
        } else {
           this.logger.warn(`Job ${job.id} type ${job.name} not implemented or payload type mismatch.`);
        }
      });

      return { success: true, jobId: job.id };
    } catch (error: any) {
      this.logger.error(
        `Error processing job ${job.id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof MarketplaceValidationException) {
        this.logger.error(
          `Validation failed for job ${job.id}, unrecoverable error.`,
        );
        throw new UnrecoverableError(error.message);
      }

      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 429 || (status && status >= 500)) {
          this.logger.warn(
            `Network error ${status} for job ${job.id}, will retry.`,
          );
          throw error; // Will be retried with exponential backoff
        }
      }

      // Default error throwing for other issues (will also be retried by BullMQ)
      throw error;
    }
  }
}
