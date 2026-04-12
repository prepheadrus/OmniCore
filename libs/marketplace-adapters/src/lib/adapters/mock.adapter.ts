import { Injectable, Logger } from '@nestjs/common';
import { IOrderSync } from '../interfaces/order-sync.interface';
import { IProductSync } from '../interfaces/product-sync.interface';
import { StandardOrderDto } from '../dtos/standard-order.dto';
import { StandardProductDto } from '../dtos/standard-product.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { MarketplaceValidationException } from '../exceptions/marketplace-validation.exception';

@Injectable()
export class MockMarketplaceAdapter implements IOrderSync, IProductSync {
  private readonly logger = new Logger(MockMarketplaceAdapter.name);

  async fetchOrders(startDate: Date, endDate: Date): Promise<StandardOrderDto[]> {
    this.logger.log(`Fetching mock orders between ${startDate.toISOString()} and ${endDate.toISOString()}`);

    // Rastgele 1-2 sipariş üret (status: 'PENDING' veya 'COMPLETED')
    const numOrders = Math.floor(Math.random() * 2) + 1;
    const mockOrders = [];

    for (let i = 0; i < numOrders; i++) {
      const orderId = `MOCK-ORD-${Math.floor(Math.random() * 1000000)}`;
      const status = Math.random() > 0.5 ? 'PENDING' : 'COMPLETED';

      mockOrders.push({
        remoteOrderId: orderId,
        orderNumber: orderId,
        totalAmount: Math.floor(Math.random() * 1000) + 50,
        currency: 'TRY',
        customerName: `Mock Customer ${i}`,
        status: status,
        createdAt: new Date(), // Simulating an order that just happened
      });
    }

    const standardOrders: StandardOrderDto[] = [];

    for (const item of mockOrders) {
      const orderDto = plainToInstance(StandardOrderDto, item);

      try {
        await validateOrReject(orderDto);
        standardOrders.push(orderDto);
      } catch (errors) {
        if (Array.isArray(errors) && errors[0] instanceof ValidationError) {
          this.logger.error(
            `Validation failed for Mock order with remoteId: ${item.remoteOrderId}`,
            JSON.stringify(errors),
          );
          throw new MarketplaceValidationException(
            'MockMarketplace',
            item.remoteOrderId,
            errors,
          );
        } else {
          throw errors;
        }
      }
    }

    return standardOrders;
  }

  async fetchProducts(limit?: number, offset?: number): Promise<StandardProductDto[]> {
    this.logger.log(`Fetching mock products. Limit: ${limit}, Offset: ${offset}`);

    const mockProducts = [
      {
        remoteProductId: `MOCK-PROD-${Math.floor(Math.random() * 100000)}`,
        name: 'Mock Product',
        sku: `SKU-MOCK-${Math.floor(Math.random() * 10000)}`,
        price: Math.floor(Math.random() * 500) + 10,
        stockQuantity: Math.floor(Math.random() * 100),
        status: 'ACTIVE',
      }
    ];

    const standardProducts: StandardProductDto[] = [];

    for (const item of mockProducts) {
      const productDto = plainToInstance(StandardProductDto, item);

      try {
        await validateOrReject(productDto);
        standardProducts.push(productDto);
      } catch (errors) {
        if (Array.isArray(errors) && errors[0] instanceof ValidationError) {
          this.logger.error(
            `Validation failed for Mock product with remoteId: ${item.remoteProductId}`,
            JSON.stringify(errors),
          );
          throw new MarketplaceValidationException('MockMarketplace', item.remoteProductId, errors);
        } else {
          throw errors;
        }
      }
    }

    return standardProducts;
  }
}
