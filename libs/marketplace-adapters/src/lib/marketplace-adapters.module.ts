import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TrendyolAdapter } from './adapters/trendyol.adapter';
import { MockMarketplaceAdapter } from './adapters/mock.adapter';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [TrendyolAdapter, MockMarketplaceAdapter],
  exports: [TrendyolAdapter, MockMarketplaceAdapter],
})
export class MarketplaceAdaptersModule {}
