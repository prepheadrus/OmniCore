import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CircularDependencyException } from '../exceptions/circular-dependency.exception';
import { OutOfStockException } from '../exceptions/out-of-stock.exception';

@Injectable()
export class InventoryReductionService {
  /**
   * Recursively reduces stock for a product or bundle.
   * Ensures that circular dependencies are caught and out of stock is handled.
   * Must be called within a Prisma transaction.
   *
   * @param productId The ID of the product or bundle to reduce stock for.
   * @param quantityToReduce The amount to reduce.
   * @param tx The Prisma transaction client.
   * @param visitedIds A Set of IDs to detect circular dependencies (internal use).
   */
  async reduceStock(
    productId: string,
    quantityToReduce: number,
    tx: Prisma.TransactionClient,
    visitedIds: Set<string> = new Set()
  ): Promise<void> {
    if (visitedIds.has(productId)) {
      throw new CircularDependencyException(productId);
    }

    visitedIds.add(productId);

    // Fetch the product with its bundle components
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: {
        bundleItems: true, // child bundles/components of this product
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    if (product.bundleItems.length > 0) {
      // It's a bundle, reduce components recursively
      for (const component of product.bundleItems) {
        await this.reduceStock(
          component.childId,
          quantityToReduce * component.quantity,
          tx,
          new Set(visitedIds)
        );
      }
    } else {
      // It's a single product, reduce its stock
      if (product.stock < quantityToReduce) {
        throw new OutOfStockException(productId);
      }

      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantityToReduce,
          },
        },
      });
    }
  }

  /**
   * Recursively calculates the maximum bundle capacity based on the stock of its components.
   * Must be called within a Prisma transaction.
   *
   * @param productId The ID of the product or bundle.
   * @param tx The Prisma transaction client.
   * @param visitedIds A Set of IDs to detect circular dependencies (internal use).
   * @returns The maximum virtual stock capacity.
   */
  async calculateMaxBundleCapacity(
    productId: string,
    tx: Prisma.TransactionClient,
    visitedIds: Set<string> = new Set()
  ): Promise<number> {
    if (visitedIds.has(productId)) {
      throw new CircularDependencyException(productId);
    }

    visitedIds.add(productId);

    const product = await tx.product.findUnique({
      where: { id: productId },
      include: {
        bundleItems: true,
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    if (product.bundleItems.length === 0) {
      // Base product
      return product.stock;
    }

    let minCapacity = Infinity;

    for (const component of product.bundleItems) {
      const childCapacity = await this.calculateMaxBundleCapacity(
        component.childId,
        tx,
        new Set(visitedIds)
      );

      const capacityForThisComponent = Math.floor(childCapacity / component.quantity);
      if (capacityForThisComponent < minCapacity) {
        minCapacity = capacityForThisComponent;
      }
    }

    return minCapacity === Infinity ? 0 : minCapacity;
  }
}
