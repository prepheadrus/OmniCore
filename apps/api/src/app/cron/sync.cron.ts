import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MockMarketplaceAdapter } from '@omnicore/marketplace-adapters';
import { MarketplaceQueueService, JobTypes } from '@omnicore/queue-management';

@Injectable()
export class SyncCronService {
  private readonly logger = new Logger(SyncCronService.name);

  constructor(
    private readonly mockAdapter: MockMarketplaceAdapter,
    private readonly queueService: MarketplaceQueueService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running marketplace sync cron job...');

    // Şu an - 2 dakika
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 2 * 60000);

    try {
      const orders = await this.mockAdapter.fetchOrders(startDate, endDate);
      this.logger.log(`Fetched ${orders.length} mock orders to sync.`);

      for (const order of orders) {
        await this.queueService.addSyncJob(JobTypes.SYNC_ORDER, {
          id: order.remoteOrderId,
          data: {
            channelId: 'trendyol-mock',
            type: JobTypes.SYNC_ORDER,
            payload: order,
          }
        });
        this.logger.debug(`Added order ${order.orderNumber} to sync queue.`);
      }
    } catch (error) {
      this.logger.error('Error during marketplace sync cron job', error);
    }
  }
}
