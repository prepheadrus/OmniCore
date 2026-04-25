import { Injectable } from '@nestjs/common';
import { CreateCategoryMappingDto } from './dto/create-category-mapping.dto';
import { UpdateCategoryMappingDto } from './dto/update-category-mapping.dto';

@Injectable()
export class CategoryMappingsService {
  create(createCategoryMappingDto: CreateCategoryMappingDto) {
    return 'This action adds a new categoryMapping';
  }

  findAll() {
    return `This action returns all categoryMappings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoryMapping`;
  }

  update(id: number, updateCategoryMappingDto: UpdateCategoryMappingDto) {
    return `This action updates a #${id} categoryMapping`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoryMapping`;
  }
}
