import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FeedQualityService } from './feed-quality.service';
import { CreateFeedQualityRuleDto, UpdateFeedQualityRuleDto } from '@omnicore/core-domain';

@Controller('feed-quality')
export class FeedQualityController {
  constructor(private readonly feedQualityService: FeedQualityService) {}

  @Post()
  create(@Body() createFeedQualityRuleDto: CreateFeedQualityRuleDto) {
    return this.feedQualityService.create(createFeedQualityRuleDto);
  }

  @Get()
  findAll() {
    return this.feedQualityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedQualityService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeedQualityRuleDto: UpdateFeedQualityRuleDto) {
    return this.feedQualityService.update(id, updateFeedQualityRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedQualityService.remove(id);
  }
}
