import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { BrandController } from './controllers/brand.controller';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { BrandService } from './services/brand.service';
import { DatabaseModule } from '@omnicore/database';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController, CategoryController, BrandController],
  providers: [ProductService, CategoryService, BrandService],
  exports: [ProductService, CategoryService, BrandService],
})
export class PimModule {}
