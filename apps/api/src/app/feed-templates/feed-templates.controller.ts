import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FeedTemplatesService } from './feed-templates.service';
import { CreateFeedTemplateDto, UpdateFeedTemplateDto } from '@omnicore/core-domain';

@Controller('feed-templates')
export class FeedTemplatesController {
  constructor(private readonly feedTemplatesService: FeedTemplatesService) {}

  @Post()
  create(@Body() createFeedTemplateDto: CreateFeedTemplateDto) {
    return this.feedTemplatesService.create(createFeedTemplateDto);
  }

  @Get()
  findAll() {
    return this.feedTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedTemplatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeedTemplateDto: UpdateFeedTemplateDto) {
    return this.feedTemplatesService.update(id, updateFeedTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedTemplatesService.remove(id);
  }
}
