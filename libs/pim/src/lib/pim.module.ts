import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { BrandController } from './controllers/brand.controller';
import { ProductService } from './services/product.service';
import { CategoryService } from './services/category.service';
import { BrandService } from './services/brand.service';
import { DatabaseModule } from '@omnicore/database';
import { BomResolverService } from './services/bom-resolver.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController, CategoryController, BrandController],
  providers: [ProductService, CategoryService, BrandService, BomResolverService],
  exports: [ProductService, CategoryService, BrandService, BomResolverService],
})
export class PimModule {}
