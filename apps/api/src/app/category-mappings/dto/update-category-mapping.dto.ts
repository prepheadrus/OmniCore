import { PartialType } from '@nestjs/swagger';
import { CreateCategoryMappingDto } from './create-category-mapping.dto';

export class UpdateCategoryMappingDto extends PartialType(CreateCategoryMappingDto) {}
