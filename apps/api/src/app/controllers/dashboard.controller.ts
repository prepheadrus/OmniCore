import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly db: DatabaseService,
    private readonly cls: ClsService
  ) {}

  @Get('summary')
  async getSummary() {
    this.cls.set('app.channel_id', 'system-admin'); // Using a system admin channel for dashboard data

    const productsCount = await this.db.client.product.count();

    // Calculate total revenue from orders
    const orders = await this.db.client.order.findMany();
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);

    return {
      productsCount,
      totalRevenue,
      currency: 'TRY'
    };
  }

  @Get('products')
  async getProducts() {
    this.cls.set('app.channel_id', 'system-admin');

    const products = await this.db.client.product.findMany({
      take: 20,
      orderBy: { updatedAt: 'desc' }
    });

    return products;
  }
}
