import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentOrchestrator } from './agents/agent-orchestrator';
import { PiiShieldService } from './services/pii-shield.service';
import { SemanticCacheService } from './services/semantic-cache.service';
import { ProductCacheSubscriber } from './subscribers/product-cache.subscriber';
import { DatabaseModule } from '@omnicore/database';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [AgentOrchestrator, PiiShieldService, SemanticCacheService, ProductCacheSubscriber],
  exports: [AgentOrchestrator, PiiShieldService, SemanticCacheService],
})
export class AiAgentsModule {}
