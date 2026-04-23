import { Module } from '@nestjs/common';
import { DatabaseModule } from '@omnicore/database';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseInvoiceController } from './purchase-invoice.controller';
import { PurchaseInvoiceService } from './purchase-invoice.service';


@Module({
  imports: [DatabaseModule],
  controllers: [SupplierController, PurchaseOrderController, PurchaseInvoiceController],
  providers: [SupplierService, PurchaseOrderService, PurchaseInvoiceService],
})
export class ProcurementModule {}
