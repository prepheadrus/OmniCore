import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreatePurchaseOrderDto, PurchaseOrderStatus } from '@omnicore/core-domain';
import { Prisma } from '@prisma/client';

@Injectable()
export class PurchaseOrderService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    let totalAmount = new Prisma.Decimal(0);
    const itemsData = createPurchaseOrderDto.items.map(item => {
      const unitCost = new Prisma.Decimal(item.unitCost);
      const quantity = new Prisma.Decimal(item.quantity);
      const totalCost = unitCost.mul(quantity);
      totalAmount = totalAmount.add(totalCost);

      return {
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitCost: unitCost,
        totalCost: totalCost
      };
    });

    return this.databaseService.client.purchaseOrder.create({
      data: {
        supplierId: createPurchaseOrderDto.supplierId,
        channelId: createPurchaseOrderDto.channelId,
        totalAmount: totalAmount,
        status: PurchaseOrderStatus.DRAFT,
        items: {
          create: itemsData
        }
      },
      include: {
        items: true
      }
    });
  }

  async findAll() {
    return this.databaseService.client.purchaseOrder.findMany({
      include: {
        supplier: true,
      }
    });
  }

  async findOne(id: string) {
    const order = await this.databaseService.client.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productVariant: true
          }
        },
        supplier: true
      }
    });

    if (!order) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, status: PurchaseOrderStatus) {
    await this.findOne(id);
    return this.databaseService.client.purchaseOrder.update({
      where: { id },
      data: { status }
    });
  }

  async receivePurchaseOrder(id: string) {
    return this.databaseService.client.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException(`Purchase Order with ID ${id} not found`);
      }

      if (order.status === 'RECEIVED') {
        throw new BadRequestException('Purchase Order is already received.');
      }

      for (const item of order.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true },
        });

        if (!variant) {
          throw new NotFoundException(`Product variant ${item.productVariantId} not found`);
        }

        const currentStock = new Prisma.Decimal(variant.stock);
        const currentAverageCost = variant.movingAverageCost;
        const newQuantity = new Prisma.Decimal(item.quantity);
        const newUnitCost = item.unitCost;

        let newMovingAverageCost: Prisma.Decimal;

        if (variant.stock <= 0) {
          // If current stock is <= 0, ignore old cost and use new unit cost
          newMovingAverageCost = newUnitCost;
        } else {
          // Moving average formula: ((Current Stock * Current Average Cost) + (New Quantity * New Unit Cost)) / (Current Stock + New Quantity)
          const currentTotalValue = currentStock.mul(currentAverageCost);
          const newTotalValue = newQuantity.mul(newUnitCost);
          const totalQuantity = currentStock.add(newQuantity);

          newMovingAverageCost = currentTotalValue.add(newTotalValue).div(totalQuantity);
        }

        // Update product variant stock and moving average cost
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: { increment: item.quantity },
            movingAverageCost: newMovingAverageCost,
          },
        });

        // Create stock movement record
        await tx.stockMovement.create({
          data: {
            productVariantId: variant.id,
            channelId: variant.product.channelId,
            eventType: 'RESTOCK',
            quantityChange: item.quantity,
            unitCost: newUnitCost,
            referenceId: order.id,
          },
        });
      }

      // Update purchase order status
      return tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
      });
    });
  }
}
