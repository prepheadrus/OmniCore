import { Injectable } from '@nestjs/common';
import { CreateFeedDto, UpdateFeedDto } from '@omnicore/core-domain';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class FeedsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cls: ClsService
  ) {}

  async create(createFeedDto: CreateFeedDto) {
    const channelId = this.cls.get('app.channel_id');
    return this.databaseService.client.productFeed.create({
      data: {
        ...createFeedDto,
        fieldMapping: createFeedDto.fieldMapping || {},
        channel: {
          connect: { id: channelId }
        }
      },
    });
  }

  async findAll() {
    return this.databaseService.client.productFeed.findMany();
  }

  async findOne(id: string) {
    return this.databaseService.client.productFeed.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateFeedDto: UpdateFeedDto) {
    return this.databaseService.client.productFeed.update({
      where: { id },
      data: updateFeedDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.client.productFeed.delete({
      where: { id },
    });
  }
}
