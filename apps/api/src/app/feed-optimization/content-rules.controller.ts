import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContentRulesService } from './content-rules.service';
import { CreateContentRuleDto, UpdateContentRuleDto } from '@omnicore/core-domain';

@Controller('content-rules')
export class ContentRulesController {
  constructor(private readonly contentRulesService: ContentRulesService) {}

  @Post()
  create(@Body() createContentRuleDto: CreateContentRuleDto) {
    return this.contentRulesService.create(createContentRuleDto);
  }

  @Get()
  findAll() {
    return this.contentRulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentRulesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentRuleDto: UpdateContentRuleDto) {
    return this.contentRulesService.update(id, updateContentRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentRulesService.remove(id);
  }
}
