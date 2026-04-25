import { Module } from '@nestjs/common';
import { CategoryMappingsService } from './category-mappings.service';
import { CategoryMappingsController } from './category-mappings.controller';
import { DatabaseModule } from '@omnicore/database';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoryMappingsController],
  providers: [CategoryMappingsService],
})
export class CategoryMappingsModule {}
