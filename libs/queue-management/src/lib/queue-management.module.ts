import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MARKETPLACE_SYNC_QUEUE, INVOICE_QUEUE, CARGO_QUEUE } from './constants/queue.constants';
import { CoreQueueService } from './services/core-queue.service';
import { MarketplaceSyncWorker } from './workers/marketplace-sync.worker';
import { InvoiceWorker } from './workers/invoice.worker';
import { CargoWorker } from './workers/cargo.worker';
import { InvoiceAdaptersModule } from '@omnicore/invoice-adapters';
import { CargoAdaptersModule } from '@omnicore/cargo-adapters';
import { RedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [
    // 1. EKLENEN KISIM: IORedis modülü yapılandırması
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        options: {
          host: configService.get<string>('REDIS_HOST') || '127.0.0.1',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
    }),
    
    // Zaten var olan BullMQ yapılandırması
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
    BullModule.registerQueue({
      name: INVOICE_QUEUE,
    }),
    BullModule.registerQueue({
      name: CARGO_QUEUE,
    }),
    InvoiceAdaptersModule,
    CargoAdaptersModule,
  ],
  providers: [CoreQueueService, MarketplaceSyncWorker, InvoiceWorker, CargoWorker],
  exports: [BullModule, CoreQueueService, RedisModule], // 2. EKLENEN KISIM: RedisModule export edildi
})
export class QueueManagementModule {}