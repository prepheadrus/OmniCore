import { Module } from '@nestjs/common';
import { FeedTemplatesService } from './feed-templates.service';
import { FeedTemplatesController } from './feed-templates.controller';
import { DatabaseModule } from '@omnicore/database';

@Module({
  imports: [DatabaseModule],
  controllers: [FeedTemplatesController],
  providers: [FeedTemplatesService],
})
export class FeedTemplatesModule {}
