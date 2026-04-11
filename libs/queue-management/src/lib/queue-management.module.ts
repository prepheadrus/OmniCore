import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MARKETPLACE_SYNC_QUEUE } from './constants/queue.constants';
import { MarketplaceQueueService } from './services/marketplace-queue.service';
import { MarketplaceSyncWorker } from './workers/marketplace-sync.worker';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || '127.0.0.1',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
    }),
    BullModule.registerQueue({
      name: MARKETPLACE_SYNC_QUEUE,
    }),
  ],
  providers: [MarketplaceQueueService, MarketplaceSyncWorker],
  exports: [BullModule, MarketplaceQueueService],
})
export class QueueManagementModule {}
