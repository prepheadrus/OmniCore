import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { IOrderSync } from '../interfaces/order-sync.interface';
import { IProductSync } from '../interfaces/product-sync.interface';
import { StandardOrderDto } from '../dtos/standard-order.dto';
import { StandardProductDto } from '../dtos/standard-product.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { MarketplaceValidationException } from '../exceptions/marketplace-validation.exception';

@Injectable()
export class TrendyolAdapter implements IOrderSync, IProductSync {
  private readonly logger = new Logger(TrendyolAdapter.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchOrders(startDate: Date, endDate: Date): Promise<StandardOrderDto[]> {
    // Simulate fetching complex nested JSON from Trendyol API
    const mockTrendyolOrdersResponse = {
      content: [
        {
          id: 123456789,
          orderNumber: 'TX-123456789',
          grossAmount: 150.5,
          currencyCode: 'TRY',
          customerFirstName: 'John',
          customerLastName: 'Doe',
          shipmentPackageStatus: 'Created',
          orderDate: new Date().getTime(),
          lines: [
            {
              id: 98765,
              productName: 'Sample Product 1',
              price: 150.5,
            },
          ],
        },
        // ... more complex mock data
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 50,
    };

    const standardOrders: StandardOrderDto[] = [];

    for (const item of mockTrendyolOrdersResponse.content) {
      const orderDto = plainToInstance(StandardOrderDto, {
        remoteOrderId: String(item.id),
        orderNumber: item.orderNumber,
        totalAmount: item.grossAmount,
        currency: item.currencyCode,
        customerName: `${item.customerFirstName} ${item.customerLastName}`,
        status: item.shipmentPackageStatus,
        createdAt: new Date(item.orderDate),
      });

      try {
        await validateOrReject(orderDto);
        standardOrders.push(orderDto);
      } catch (errors) {
        if (Array.isArray(errors) && errors[0] instanceof ValidationError) {
            this.logger.error(`Validation failed for Trendyol order with remoteId: ${item.id}`, JSON.stringify(errors));
            throw new MarketplaceValidationException('Trendyol', String(item.id), errors);
        } else {
            this.logger.error(`Unknown error during validation for Trendyol order with remoteId: ${item.id}`, errors);
            throw errors;
        }
      }
    }

    return standardOrders;
  }

  async fetchProducts(limit?: number, offset?: number): Promise<StandardProductDto[]> {
    // Simulate fetching complex nested JSON from Trendyol API
    const mockTrendyolProductsResponse = {
      content: [
        {
          id: 'PROD-001',
          title: 'Sample Product',
          productCode: 'SKU-123',
          salePrice: 199.99,
          quantity: 10,
          approved: true,
          archived: false,
        },
        // ... more complex mock data
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 50,
    };

    const standardProducts: StandardProductDto[] = [];

    for (const item of mockTrendyolProductsResponse.content) {
      const productDto = plainToInstance(StandardProductDto, {
        remoteProductId: item.id,
        name: item.title,
        sku: item.productCode,
        price: item.salePrice,
        stockQuantity: item.quantity,
        status: item.approved && !item.archived ? 'ACTIVE' : 'INACTIVE',
      });

      try {
        await validateOrReject(productDto);
        standardProducts.push(productDto);
      } catch (errors) {
          if (Array.isArray(errors) && errors[0] instanceof ValidationError) {
              this.logger.error(`Validation failed for Trendyol product with remoteId: ${item.id}`, JSON.stringify(errors));
              throw new MarketplaceValidationException('Trendyol', item.id, errors);
          } else {
            this.logger.error(`Unknown error during validation for Trendyol product with remoteId: ${item.id}`, errors);
            throw errors;
          }
      }
    }

    return standardProducts;
  }
}
