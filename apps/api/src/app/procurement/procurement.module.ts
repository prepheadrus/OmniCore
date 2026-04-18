import { Module } from '@nestjs/common';
import { DatabaseModule } from '@omnicore/database';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SupplierController, PurchaseOrderController],
  providers: [SupplierService, PurchaseOrderService],
})
export class ProcurementModule {}
