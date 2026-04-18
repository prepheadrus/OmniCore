import { Controller, Get, Post, Query, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { GetOrdersFilterDto, CalculateFinanceRequestDto } from '@omnicore/core-domain';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getOrders(@Query() filter: GetOrdersFilterDto) {
    return this.orderService.getOrders(filter);
  }

  @Post(':id/finance/calculate')
  @HttpCode(HttpStatus.OK)
  async calculateNetProfit(
    @Param('id') id: string,
    @Body() calculateFinanceDto: CalculateFinanceRequestDto,
  ) {
    return this.orderService.calculateNetProfit(id, calculateFinanceDto);
  }

  @Get(':id/finance')
  async getFinanceDetails(@Param('id') id: string) {
    return this.orderService.getFinanceDetails(id);
  }
}
