import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { GetOrdersFilterDto } from '@omnicore/core-domain';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getOrders(filter: GetOrdersFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (filter.channelId) {
      where.channelId = filter.channelId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.q) {
      where.orderNumber = {
        contains: filter.q,
        mode: 'insensitive',
      };
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [filter.sortBy ?? 'createdAt']: filter.sortOrder ?? 'desc',
    };

    const [data, total] = await Promise.all([
      this.databaseService.client.order.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.databaseService.client.order.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
