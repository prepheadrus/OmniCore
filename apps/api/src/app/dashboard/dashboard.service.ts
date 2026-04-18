import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class DashboardService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cls: ClsService
  ) {}

  async getSummary() {
    this.cls.set('app.channel_id', 'system-admin');

    const productsCount = await this.db.client.product.count();

    // PERFORMANCE GAIN: O(1) DB aggregation instead of O(N) memory reduce.
    const result = await this.db.client.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });
    const totalRevenue = result._sum.totalAmount || 0;

    return {
      productsCount,
      totalRevenue,
      currency: 'TRY',
    };
  }

  async getProducts() {
    this.cls.set('app.channel_id', 'system-admin');

    return this.db.client.product.findMany({
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });
  }
}
