import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MARKETPLACE_SYNC_QUEUE, JobTypes } from '../constants/queue.constants';
import { IMarketplaceJobPayload } from '../interfaces/marketplace-job-payload.interface';
import { MarketplaceValidationException } from '@omnicore/marketplace-adapters';
import { isAxiosError } from 'axios';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';
import { CoreQueueService } from '../services/core-queue.service';

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
    private readonly queueService: CoreQueueService,
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

        // Ensure channel exists before doing any operations
        if ([JobTypes.SYNC_ORDER, JobTypes.SYNC_PRODUCT].includes(job.name as JobTypes)) {
          const channelName = channelId
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          await this.databaseService.client.salesChannel.upsert({
            where: { id: channelId },
            create: {
              id: channelId,
              name: channelName,
            },
            update: {}, // We only want to ensure it exists, not override if it already exists
          });
        }

        if (job.name === JobTypes.FETCH_ORDERS && type === JobTypes.FETCH_ORDERS) {
          this.logger.log(`Fetching orders for channelId ${channelId}`);

          // Generate mock orders
          const mockOrders = [
            { orderNumber: `ORD-${Date.now()}-1`, totalAmount: 100.50, status: 'CREATED', createdAt: new Date() },
            { orderNumber: `ORD-${Date.now()}-2`, totalAmount: 250.00, status: 'SHIPPED', createdAt: new Date() },
          ];

          for (const order of mockOrders) {
            await this.queueService.addSyncJob(JobTypes.SYNC_ORDER, {
              channelId: channelId,
              type: JobTypes.SYNC_ORDER,
              payload: order,
            }, order.orderNumber);
            this.logger.debug(`Enqueued SYNC_ORDER job for order ${order.orderNumber}`);
          }
        } else if (job.name === JobTypes.FETCH_PRODUCTS && type === JobTypes.FETCH_PRODUCTS) {
          this.logger.log(`Fetching products for channelId ${channelId}`);

          // Generate mock products
          const mockProducts = [
            { sku: `SKU-${Date.now()}-1`, name: 'Mock Product 1', price: 99.99, stock: 10, description: "Harika bir ürün", attributes: { color: "red" } },
            { sku: `SKU-${Date.now()}-2`, name: 'Mock Product 2', price: 149.99, stock: 5, description: "Efsane bir ürün", attributes: { color: "blue" } },
          ];

          for (const product of mockProducts) {
            await this.queueService.addSyncJob(JobTypes.SYNC_PRODUCT, {
              channelId: channelId,
              type: JobTypes.SYNC_PRODUCT,
              payload: product,
            }, product.sku);
            this.logger.debug(`Enqueued SYNC_PRODUCT job for product ${product.sku}`);
          }
        } else if (job.name === JobTypes.SYNC_ORDER && type === JobTypes.SYNC_ORDER) {
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

          // Enqueue invoice generation job
          await this.queueService.addInvoiceJob(JobTypes.GENERATE_INVOICE, {
            orderId: order.orderNumber,
            channelId: channelId,
          }, `invoice-${order.orderNumber}`);
          this.logger.log(`Enqueued GENERATE_INVOICE job for order ${order.orderNumber}`);

        } else if (job.name === JobTypes.SYNC_PRODUCT && type === JobTypes.SYNC_PRODUCT) {
          const product = payload;

          await this.databaseService.client.product.upsert({
            where: { sku: product.sku },
            create: {
              sku: product.sku,
              name: product.name,
              price: product.price,
              description: product.description,
              attributes: product.attributes,
              channelId: channelId,
            },
            update: {
              name: product.name,
              price: product.price,
              description: product.description,
              attributes: product.attributes,
              updatedAt: new Date(),
            },
          });

          this.logger.log(`Successfully upserted product ${product.sku} for channel ${channelId}`);
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
