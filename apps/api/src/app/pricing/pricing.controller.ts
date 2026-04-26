import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { RepricerRuleFormData } from '@omnicore/core-domain';

@Controller('pricing')
export class PricingController {
  constructor(private readonly db: DatabaseService) {}

  @Post('rules')
  async create(@Body() createRuleDto: RepricerRuleFormData) {
    return this.db.client.repricerRule.create({
      data: createRuleDto as any,
    });
  }

  @Get('rules')
  async findAll() {
    return this.db.client.repricerRule.findMany();
  }
}
