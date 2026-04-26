import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { RepricerRuleFormData } from '@omnicore/core-domain';
import { ClsService } from 'nestjs-cls';

@Controller('pricing')
export class PricingController {
  constructor(
    private readonly db: DatabaseService,
    private readonly cls: ClsService,
  ) {}

  @Post('rules')
  async create(@Body() createRuleDto: RepricerRuleFormData) {
    const channelId = this.cls.get('app.channel_id');

    return this.db.client.repricerRule.create({
      data: {
        ...(createRuleDto as any),
        channelId,
      },
    });
  }

  @Get('rules')
  async findAll() {
    return this.db.client.repricerRule.findMany();
  }
}
