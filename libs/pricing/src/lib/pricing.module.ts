import { Module } from '@nestjs/common';
import { DatabaseModule } from '@omnicore/database';
import { QueueManagementModule } from '@omnicore/queue-management';
import { RepricerService } from './services/repricer.service';

@Module({
  imports: [DatabaseModule, QueueManagementModule],
  controllers: [],
  providers: [RepricerService],
  exports: [RepricerService],
})
export class PricingModule {}
