import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TrendyolAdapter } from './adapters/trendyol.adapter';

@Module({
  imports: [HttpModule],
  providers: [TrendyolAdapter],
  exports: [TrendyolAdapter],
})
export class MarketplaceAdaptersModule {}
