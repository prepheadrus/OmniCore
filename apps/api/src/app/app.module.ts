import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChannelMiddleware } from './middleware/channel.middleware';
import { DatabaseModule } from '@omnicore/database';
import { QueueManagementModule } from '@omnicore/queue-management';
import { MarketplaceAdaptersModule } from '@omnicore/marketplace-adapters';
import { AiAgentsModule } from '@omnicore/ai-agents';
import { AiAgentController } from './controllers/ai-agent.controller';
import { QueueController } from './controllers/queue.controller';
import { DashboardModule } from './dashboard/dashboard.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncCronService } from './cron/sync.cron';
import { PimModule } from '@omnicore/pim';
import { OrderModule } from './order/order.module';
import { ProcurementModule } from './procurement/procurement.module';
import { FeedsModule } from './feeds/feeds.module';
import { CategoryMappingsModule } from './category-mappings/category-mappings.module';
import { FeedTemplatesModule } from './feed-templates/feed-templates.module';
import { FeedOptimizationModule } from './feed-optimization/feed-optimization.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    QueueManagementModule,
    MarketplaceAdaptersModule,
    AiAgentsModule,
    PimModule,
    OrderModule,
    DashboardModule,
    ProcurementModule,
    FeedsModule,
    CategoryMappingsModule,
    FeedTemplatesModule,
    FeedOptimizationModule,
  ],
  controllers: [AppController, AiAgentController, QueueController, ],
  providers: [AppService, SyncCronService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ChannelMiddleware)
      .exclude({ path: 'chat', method: RequestMethod.POST })
      .forRoutes('*');
  }
}
