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
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { BomResolverService } from '@omnicore/pim';

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
    @InjectRedis() private readonly redis: Redis,
    private readonly bomResolverService: BomResolverService,
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

        if (job.name === JobTypes.FETCH_ORDERS) {
          this.logger.log('Mock fetch successful for FETCH_ORDERS');
          return;
        } else if (job.name === JobTypes.FETCH_PRODUCTS) {
          this.logger.log('Mock fetch successful for FETCH_PRODUCTS');
          return;
        } else if (job.name === JobTypes.SYNC_ORDER && type === JobTypes.SYNC_ORDER) {
          const order = payload;

          // CQRS and Event Sourcing: Order UPSERT + StockMovement Insert + ProductVariant stock update in a single transaction
          await this.databaseService.client.$transaction(async (tx) => {
            // 1. Save the Order
            await tx.order.upsert({
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

            // For now, we assume order has a list of items to process, here represented by a single mock variant.
            // In a real scenario, this would iterate over order line items.
            const variantToProcess = await tx.productVariant.findFirst({
               where: { product: { channelId } }
            });

            if (variantToProcess) {
               // Resolve BOM if it's a bundle or just get the item itself
               const quantitySold = 1; // Simulated order quantity
               const resolvedItems = await this.bomResolverService.resolveBundle(variantToProcess.id, quantitySold);

               // 2 & 3. For each physical item, log StockMovement and decrement stock
               for (const [physicalVariantId, totalDeduction] of resolvedItems.entries()) {
                 await tx.stockMovement.create({
                   data: {
                     productVariantId: physicalVariantId,
                     channelId: channelId,
                     eventType: 'SALE',
                     quantityChange: -totalDeduction,
                     referenceId: order.orderNumber,
                   }
                 });

                 await tx.productVariant.update({
                   where: { id: physicalVariantId },
                   data: { stock: { decrement: totalDeduction } }
                 });
               }
            }
          });

          this.logger.log(`Successfully processed order ${order.orderNumber} with CQRS stock update for channel ${channelId}`);

          // Enqueue invoice generation job only if status is SHIPPED or DELIVERED
          if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
            await this.queueService.addInvoiceJob(JobTypes.GENERATE_INVOICE, {
              orderId: order.orderNumber,
              channelId: channelId,
            }, `invoice-${order.orderNumber}`);
            this.logger.log(`Enqueued GENERATE_INVOICE job for order ${order.orderNumber}`);
          } else {
            this.logger.log(`Skipped GENERATE_INVOICE job for order ${order.orderNumber} because status is ${order.status}`);
          }

        } else if (job.name === JobTypes.SYNC_PRODUCT && type === JobTypes.SYNC_PRODUCT) {
          const product = payload;

          // Try to find if variant already exists
          const existingVariant = await this.databaseService.client.productVariant.findUnique({
            where: { sku: product.sku },
            include: { product: true }
          });

          if (existingVariant) {
            // Update existing variant and its parent product
            await this.databaseService.client.product.update({
              where: { id: existingVariant.productId },
              data: {
                name: product.name,
                description: product.description,
                updatedAt: new Date(),
              }
            });

            await this.databaseService.client.productVariant.update({
              where: { id: existingVariant.id },
              data: {
                price: product.price,
                stock: product.stock !== undefined ? product.stock : existingVariant.stock,
                attributes: product.attributes,
                updatedAt: new Date(),
              }
            });
            this.logger.log(`Successfully updated product & variant ${product.sku} for channel ${channelId}`);
          } else {
            // Create new product and variant
            await this.databaseService.client.product.create({
              data: {
                name: product.name,
                description: product.description,
                channelId: channelId,
                variants: {
                  create: {
                    sku: product.sku,
                    price: product.price,
                    attributes: product.attributes,
                    stock: product.stock || 0,
                  }
                }
              },
            });
            this.logger.log(`Successfully created product & variant ${product.sku} for channel ${channelId}`);
          }
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
