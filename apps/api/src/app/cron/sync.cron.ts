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

    try {
      const channelId = 'trendyol-mock';

      await this.queueService.addSyncJob(JobTypes.FETCH_ORDERS, {
        id: `fetch-orders-${Date.now()}`,
        data: {
          channelId: channelId,
          type: JobTypes.FETCH_ORDERS,
        }
      });
      this.logger.debug(`Added FETCH_ORDERS job to sync queue for channel ${channelId}.`);

      await this.queueService.addSyncJob(JobTypes.FETCH_PRODUCTS, {
        id: `fetch-products-${Date.now()}`,
        data: {
          channelId: channelId,
          type: JobTypes.FETCH_PRODUCTS,
        }
      });
      this.logger.debug(`Added FETCH_PRODUCTS job to sync queue for channel ${channelId}.`);

    } catch (error) {
      this.logger.error('Error during marketplace sync cron job', error);
    }
  }
}
