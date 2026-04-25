import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { Prisma } from '@prisma/client';
import { GetProductsFilterDto } from '@omnicore/core-domain';

@Injectable()
export class ProductService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getProducts(filter: GetProductsFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (filter.channelId) {
      where.channelId = filter.channelId;
    }

    if (filter.q) {
      where.OR = [
        { name: { contains: filter.q, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: filter.q, mode: 'insensitive' } } } }
      ];
    }

    if (filter.stockStatus) {
      if (filter.stockStatus === 'in_stock') {
        where.stock = { gt: 0 };
      } else if (filter.stockStatus === 'out_of_stock') {
        where.stock = { equals: 0 };
      }
    }

    if (filter.status) {
      if (filter.status === 'INACTIVE') {
        where.isActive = false;
      } else {
        where.isActive = true;
        if (filter.status === 'IN_STOCK') {
          where.stock = { gt: 0 };
        } else if (filter.status === 'OUT_OF_STOCK') {
          where.stock = { equals: 0 };
        }
      }
    }

    if (filter.categoryId && filter.categoryId !== 'ALL') {
      where.categoryId = filter.categoryId;
    }

    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      where.price = {};
      if (filter.minPrice !== undefined) {
        where.price.gte = filter.minPrice;
      }
      if (filter.maxPrice !== undefined) {
        where.price.lte = filter.maxPrice;
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [filter.sortBy ?? 'createdAt']: filter.sortOrder ?? 'desc',
    };

    const [data, total] = await Promise.all([
      this.databaseService.client.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          brand: true,
          variants: true,
        },
      }),
      this.databaseService.client.product.count({ where }),
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

  async updateProductInline(id: string, field: string, value: number | string) {
    return this.databaseService.client.product.update({
      where: { id },
      data: {
        [field]: value,
      },
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
