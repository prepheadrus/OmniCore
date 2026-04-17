import { Controller, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { GetOrdersFilterDto } from '@omnicore/core-domain';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getOrders(@Query() filter: GetOrdersFilterDto) {
    return this.orderService.getOrders(filter);
  }
}
