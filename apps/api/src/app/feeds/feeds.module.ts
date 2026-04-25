import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { DatabaseModule } from '@omnicore/database';

@Module({
  imports: [DatabaseModule],
  controllers: [FeedsController],
  providers: [FeedsService],
})
export class FeedsModule {}
