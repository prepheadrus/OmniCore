import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { Prisma } from '@prisma/client';
import { GetProductsFilterDto, UpsertProductDto } from '@omnicore/core-domain';
import { v4 as uuidv4 } from 'uuid';

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
        where.variants = {
          some: {
            stock: { gt: 0 }
          }
        };
      } else if (filter.stockStatus === 'out_of_stock') {
        where.variants = {
          every: {
            stock: { equals: 0 }
          }
        };
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

  async upsertProduct(data: UpsertProductDto, channelId: string) {
    return this.databaseService.client.$transaction(async (tx) => {
      // 1. Create or Update Product
      let product;

      const productData = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId,
        channelId: channelId,
      };

      if (data.id) {
        product = await tx.product.update({
          where: { id: data.id },
          data: productData,
        });
      } else {
        product = await tx.product.create({
          data: productData,
        });
      }

      // 2. Handle Variants & Channel Info
      // Currently, we assume the primary variant acts as the product representation in single-variant case
      const variantSku = data.sku || `SKU-${product.id}`;
      const basePrice = data.channels?.find(c => c.channelId === channelId)?.price || 0;
      const baseStock = data.channels?.find(c => c.channelId === channelId)?.stock || 0;
      const baseCostPrice = data.costPrice || 0;

      let mainVariant;

      // Upsert the main variant (simplified assumption for now, ideally each channel might have its own record or JSON representation depending on the schema)
      const existingVariants = await tx.productVariant.findMany({ where: { productId: product.id } });

      if (existingVariants.length > 0) {
        mainVariant = await tx.productVariant.update({
          where: { id: existingVariants[0].id },
          data: {
            sku: variantSku,
            price: basePrice,
            stock: baseStock,
            movingAverageCost: baseCostPrice,
            isBundle: (data.bundleItems && data.bundleItems.length > 0) ? true : false,
          }
        });
      } else {
         mainVariant = await tx.productVariant.create({
           data: {
             productId: product.id,
             sku: variantSku,
             price: basePrice,
             stock: baseStock,
             movingAverageCost: baseCostPrice,
             isBundle: (data.bundleItems && data.bundleItems.length > 0) ? true : false,
           }
         });
      }

      // 3. Handle Bundle Items (BOM logic)
      if (data.bundleItems && data.bundleItems.length > 0) {
        // Clear existing bundle items for this variant
        await tx.bundleComponent.deleteMany({
          where: { parentVariantId: mainVariant.id }
        });

        const bundleData = data.bundleItems.map(item => ({
           parentVariantId: mainVariant.id,
           childVariantId: item.variantId,
           quantity: item.quantity,
        }));

        await tx.bundleComponent.createMany({
          data: bundleData
        });
      } else if (existingVariants.length > 0 && mainVariant.isBundle) {
        // If it was a bundle but not anymore, clear components
         await tx.bundleComponent.deleteMany({
          where: { parentVariantId: mainVariant.id }
        });
      }

      return product;
    });
  }

}