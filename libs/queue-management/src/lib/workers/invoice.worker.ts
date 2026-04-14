import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { INVOICE_QUEUE, JobTypes } from '../constants/queue.constants';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';
import { CoreQueueService } from '../services/core-queue.service';
import { InvoiceAdapterFactory } from '@omnicore/invoice-adapters';

@Processor(INVOICE_QUEUE, {
  limiter: {
    max: 100,
    duration: 60000,
  },
})
export class InvoiceWorker extends WorkerHost {
  private readonly logger = new Logger(InvoiceWorker.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly clsService: ClsService,
    private readonly queueService: CoreQueueService,
    private readonly invoiceAdapterFactory: InvoiceAdapterFactory,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing invoice job ${job.id}`);

    try {
      const { channelId, orderId } = job.data as any;

      if (!channelId || !orderId) {
        throw new UnrecoverableError(`Invoice job ${job.id} is missing channelId or orderId.`);
      }

      await this.clsService.runWith({} as any, async () => {
        this.clsService.set('app.channel_id', channelId);

        const order = await this.databaseService.client.order.findUnique({
          where: { orderNumber: orderId },
        });

        if (!order) {
           throw new UnrecoverableError(`Order ${orderId} not found in database for channel ${channelId}`);
        }

        this.logger.debug(`Generating invoice for order ${order.orderNumber}`);

        const adapter = this.invoiceAdapterFactory.getAdapter('parasut');
        const invoiceResult = await adapter.generateInvoice(order);

        this.logger.log(`Successfully generated invoice for order ${order.orderNumber}. Result: ${invoiceResult}`);

        // Enqueue cargo barcode generation job
        await this.queueService.addCargoJob(JobTypes.GENERATE_CARGO_BARCODE, {
            orderId: order.orderNumber,
            channelId: channelId,
        }, `cargo-${order.orderNumber}`);
        this.logger.log(`Enqueued GENERATE_CARGO_BARCODE job for order ${order.orderNumber}`);
      });

      return { success: true, jobId: job.id };
    } catch (error: any) {
      this.logger.error(
        `Error processing invoice job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
