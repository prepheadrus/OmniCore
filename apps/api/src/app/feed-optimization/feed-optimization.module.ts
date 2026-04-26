import { Module } from '@nestjs/common';
import { ContentRulesController } from './content-rules.controller';
import { ContentRulesService } from './content-rules.service';
import { FeedQualityController } from './feed-quality.controller';
import { FeedQualityService } from './feed-quality.service';

@Module({
  controllers: [ContentRulesController, FeedQualityController],
  providers: [ContentRulesService, FeedQualityService],
  exports: [ContentRulesService, FeedQualityService],
})
export class FeedOptimizationModule {}
