import { Module } from '@nestjs/common';
import { InventoryReductionService } from './services/inventory-reduction.service';

@Module({
  controllers: [],
  providers: [InventoryReductionService],
  exports: [InventoryReductionService],
})
export class CoreDomainModule {}
