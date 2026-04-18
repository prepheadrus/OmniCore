import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from '@omnicore/core-domain';

@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrderService.create(createPurchaseOrderDto);
  }

  @Get()
  findAll() {
    return this.purchaseOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdatePurchaseOrderStatusDto,
  ) {
    if (updateStatusDto.status === 'RECEIVED') {
      return this.purchaseOrderService.receivePurchaseOrder(id);
    }
    return this.purchaseOrderService.updateStatus(id, updateStatusDto.status);
  }
}
