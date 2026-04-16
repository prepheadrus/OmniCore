import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';

@Injectable()
export class ProductService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getProducts() {
    return this.databaseService.client.product.findMany({
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });
  }

  async getProduct(id: string) {
    return this.databaseService.client.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });
  }

  async createProduct(data: any) {
    return this.databaseService.client.product.create({
      data,
    });
  }

  async updateProduct(id: string, data: any) {
    return this.databaseService.client.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string) {
    return this.databaseService.client.product.delete({
      where: { id },
    });
  }

  async createVariant(productId: string, data: any) {
    return this.databaseService.client.productVariant.create({
      data: {
        ...data,
        productId,
      },
    });
  }

  async updateVariant(variantId: string, data: any) {
    return this.databaseService.client.productVariant.update({
      where: { id: variantId },
      data,
    });
  }
}
