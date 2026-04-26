import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreateFeedQualityRuleDto, UpdateFeedQualityRuleDto } from '@omnicore/core-domain';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class FeedQualityService {
  constructor(
    private db: DatabaseService,
    private cls: ClsService
  ) {}

  async create(createDto: CreateFeedQualityRuleDto) {
    const channelId = this.cls.get('app.channel_id');
    return this.db.client.feedQualityRule.create({
      data: {
        ...createDto,
        channelId,
      },
    });
  }

  async findAll() {
    return this.db.client.feedQualityRule.findMany();
  }

  async findOne(id: string) {
    const rule = await this.db.client.feedQualityRule.findUnique({
      where: { id },
    });
    if (!rule) {
      throw new NotFoundException(`FeedQualityRule with ID ${id} not found`);
    }
    return rule;
  }

  async update(id: string, updateDto: UpdateFeedQualityRuleDto) {
    await this.findOne(id);

    return this.db.client.feedQualityRule.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.db.client.feedQualityRule.delete({
      where: { id },
    });
  }
}
