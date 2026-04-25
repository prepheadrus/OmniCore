import { Injectable } from '@nestjs/common';
import { CreateCategoryMappingDto, UpdateCategoryMappingDto } from '@omnicore/core-domain';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class CategoryMappingsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cls: ClsService
  ) {}

  async create(createCategoryMappingDto: CreateCategoryMappingDto) {
    const channelId = this.cls.get('app.channel_id');
    return this.databaseService.client.categoryMapping.create({
      data: {
        ...createCategoryMappingDto,
        channel: {
          connect: { id: channelId }
        }
      },
    });
  }

  async findAll() {
    return this.databaseService.client.categoryMapping.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.client.categoryMapping.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateCategoryMappingDto: UpdateCategoryMappingDto) {
    return this.databaseService.client.categoryMapping.update({
      where: { id },
      data: updateCategoryMappingDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.client.categoryMapping.delete({
      where: { id },
    });
  }
}
