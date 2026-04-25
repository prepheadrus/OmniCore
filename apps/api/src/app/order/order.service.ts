import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { GetOrdersFilterDto, CalculateFinanceRequestDto } from '@omnicore/core-domain';
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

    if (filter.status && filter.status !== 'ALL') {
      where.status = filter.status;
    }

    if (filter.q) {
      where.OR = [
        {
          orderNumber: {
            contains: filter.q,
            mode: 'insensitive',
          },
        },
        {
          customerName: {
            contains: filter.q,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (filter.marketplace && filter.marketplace !== 'ALL') {
      where.marketplace = filter.marketplace;
    }

    if (filter.carrier && filter.carrier !== 'ALL') {
      where.carrier = filter.carrier;
    }

    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) {
        where.createdAt.gte = new Date(filter.dateFrom);
      }
      if (filter.dateTo) {
        where.createdAt.lte = new Date(filter.dateTo);
      }
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

  async calculateNetProfit(orderId: string, dto: CalculateFinanceRequestDto) {
    return this.databaseService.client.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${orderId} not found`);
      }

      const costPrice = new Prisma.Decimal(dto.costPrice ?? order.costPrice);
      const commissionAmount = new Prisma.Decimal(dto.commissionAmount ?? order.commissionAmount);
      const shippingCost = new Prisma.Decimal(dto.shippingCost ?? order.shippingCost);
      const taxAmount = new Prisma.Decimal(dto.taxAmount ?? order.taxAmount);
      const discountAmount = new Prisma.Decimal(dto.discountAmount ?? order.discountAmount);

      const totalAmount = new Prisma.Decimal(order.totalAmount);

      const totalDeductions = costPrice.add(commissionAmount).add(shippingCost).add(taxAmount).add(discountAmount);
      const netProfit = totalAmount.sub(totalDeductions);

      return tx.order.update({
        where: { id: orderId },
        data: {
          costPrice,
          commissionAmount,
          shippingCost,
          taxAmount,
          discountAmount,
          netProfit,
          settlementStatus: 'CALCULATED',
        },
      });
    });
  }

  async getFinanceDetails(orderId: string) {
    const order = await this.databaseService.client.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        costPrice: true,
        commissionAmount: true,
        shippingCost: true,
        taxAmount: true,
        discountAmount: true,
        netProfit: true,
        settlementStatus: true,
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return order;
  }
}
