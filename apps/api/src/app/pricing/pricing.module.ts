import { Module } from '@nestjs/common';
import { DatabaseModule } from '@omnicore/database';
import { PricingController } from './pricing.controller';
import { PricingModule as CorePricingModule } from '@omnicore/pricing';

@Module({
  imports: [DatabaseModule, CorePricingModule],
  controllers: [PricingController],
  providers: [],
})
export class PricingApiModule {}
