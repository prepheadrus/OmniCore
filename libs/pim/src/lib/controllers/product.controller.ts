import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { Product, ProductVariant } from '@prisma/client';
import { GetProductsFilterDto } from '@omnicore/core-domain';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(@Query() filter: GetProductsFilterDto) {
    return this.productService.getProducts(filter);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProduct(id);
  }

  @Post()
  async createProduct(@Body() data: any) {
    return this.productService.createProduct(data);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.productService.updateProduct(id, data);
  }

  @Post(':id/inline')
  async updateProductInline(
    @Param('id') id: string,
    @Body() data: { field: string; value: number | string }
  ) {
    return this.productService.updateProductInline(id, data.field, data.value);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

  @Post(':id/variants')
  async createVariant(@Param('id') id: string, @Body() data: any) {
    return this.productService.createVariant(id, data);
  }

  @Put(':id/variants/:variantId')
  async updateVariant(@Param('id') productId: string, @Param('variantId') variantId: string, @Body() data: any) {
    return this.productService.updateVariant(variantId, data);
  }
}
