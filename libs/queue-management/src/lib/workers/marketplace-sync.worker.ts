import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MARKETPLACE_SYNC_QUEUE } from '../constants/queue.constants';
import { IMarketplaceJobPayload } from '../interfaces/marketplace-job-payload.interface';
import { MarketplaceValidationException } from '@omnicore/marketplace-adapters';
import { isAxiosError } from 'axios';

@Processor(MARKETPLACE_SYNC_QUEUE, {
  limiter: {
    max: 1000,
    duration: 60000,
  },
})
export class MarketplaceSyncWorker extends WorkerHost {
  private readonly logger = new Logger(MarketplaceSyncWorker.name);

  async process(job: Job<IMarketplaceJobPayload>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      // Mock processing logic (the actual logic would call an external API)
      this.logger.debug(`Job ${job.id} payload:`, job.data);

      // Simulate successful processing
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
