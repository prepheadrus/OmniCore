import { Module } from '@nestjs/common';
import { CategoryMappingsService } from './category-mappings.service';
import { CategoryMappingsController } from './category-mappings.controller';

@Module({
  controllers: [CategoryMappingsController],
  providers: [CategoryMappingsService],
})
export class CategoryMappingsModule {}
