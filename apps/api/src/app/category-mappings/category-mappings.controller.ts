import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryMappingsService } from './category-mappings.service';
import { CreateCategoryMappingDto } from './dto/create-category-mapping.dto';
import { UpdateCategoryMappingDto } from './dto/update-category-mapping.dto';

@Controller('category-mappings')
export class CategoryMappingsController {
  constructor(private readonly categoryMappingsService: CategoryMappingsService) {}

  @Post()
  create(@Body() createCategoryMappingDto: CreateCategoryMappingDto) {
    return this.categoryMappingsService.create(createCategoryMappingDto);
  }

  @Get()
  findAll() {
    return this.categoryMappingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryMappingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryMappingDto: UpdateCategoryMappingDto) {
    return this.categoryMappingsService.update(+id, updateCategoryMappingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryMappingsService.remove(+id);
  }
}
