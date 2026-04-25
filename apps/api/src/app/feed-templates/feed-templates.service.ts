import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreateFeedTemplateDto, UpdateFeedTemplateDto } from '@omnicore/core-domain';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class FeedTemplatesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly cls: ClsService
  ) {}

  async create(createFeedTemplateDto: CreateFeedTemplateDto) {
    const channelId = this.cls.get('app.channel_id');

    return this.db.client.feedTemplate.create({
      data: {
        ...createFeedTemplateDto,
        channelId: channelId,
      },
    });
  }

  async findAll() {
    return this.db.client.feedTemplate.findMany();
  }

  async findOne(id: string) {
    const feedTemplate = await this.db.client.feedTemplate.findUnique({
      where: { id },
    });

    if (!feedTemplate) {
      throw new NotFoundException(`FeedTemplate with ID ${id} not found`);
    }

    return feedTemplate;
  }

  async update(id: string, updateFeedTemplateDto: UpdateFeedTemplateDto) {
    // Check existence first
    await this.findOne(id);

    return this.db.client.feedTemplate.update({
      where: { id },
      data: updateFeedTemplateDto,
    });
  }

  async remove(id: string) {
    // Check existence first
    await this.findOne(id);

    return this.db.client.feedTemplate.delete({
      where: { id },
    });
  }
}
