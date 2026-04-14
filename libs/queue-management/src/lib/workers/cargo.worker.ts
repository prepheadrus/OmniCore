import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { CARGO_QUEUE } from '../constants/queue.constants';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';
import { CargoAdapterFactory } from '@omnicore/cargo-adapters';

@Processor(CARGO_QUEUE, {
  limiter: {
    max: 100,
    duration: 60000,
  },
})
export class CargoWorker extends WorkerHost {
  private readonly logger = new Logger(CargoWorker.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly clsService: ClsService,
    private readonly cargoAdapterFactory: CargoAdapterFactory,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing cargo job ${job.id}`);

    try {
      const { channelId, orderId } = job.data as any;

      if (!channelId || !orderId) {
        throw new UnrecoverableError(`Cargo job ${job.id} is missing channelId or orderId.`);
      }

      await this.clsService.runWith({} as any, async () => {
        this.clsService.set('app.channel_id', channelId);

        const order = await this.databaseService.client.order.findUnique({
          where: { orderNumber: orderId },
        });

        if (!order) {
           throw new UnrecoverableError(`Order ${orderId} not found in database for channel ${channelId}`);
        }

        this.logger.debug(`Generating cargo barcode for order ${order.orderNumber}`);

        const adapter = this.cargoAdapterFactory.getAdapter('yurtici');
        const barcodeResult = await adapter.generateBarcode(order);

        this.logger.log(`Successfully generated cargo barcode for order ${order.orderNumber}. Result: ${barcodeResult}`);
        this.logger.log(`Sipariş ${order.orderNumber} için barkod oluşturuldu`);
      });

      return { success: true, jobId: job.id };
    } catch (error: any) {
      this.logger.error(
        `Error processing cargo job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
