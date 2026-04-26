import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreateContentRuleDto, UpdateContentRuleDto } from '@omnicore/core-domain';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ContentRulesService {
  constructor(
    private db: DatabaseService,
    private cls: ClsService
  ) {}

  async create(createDto: CreateContentRuleDto) {
    const channelId = this.cls.get('app.channel_id');
    return this.db.client.contentRule.create({
      data: {
        ...createDto,
        channelId,
        variables: createDto.variables || {},
      },
    });
  }

  async findAll() {
    return this.db.client.contentRule.findMany();
  }

  async findOne(id: string) {
    const rule = await this.db.client.contentRule.findUnique({
      where: { id },
    });
    if (!rule) {
      throw new NotFoundException(`ContentRule with ID ${id} not found`);
    }
    return rule;
  }

  async update(id: string, updateDto: UpdateContentRuleDto) {
    // Check if exists
    await this.findOne(id);

    return this.db.client.contentRule.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    // Check if exists
    await this.findOne(id);

    return this.db.client.contentRule.delete({
      where: { id },
    });
  }
}
