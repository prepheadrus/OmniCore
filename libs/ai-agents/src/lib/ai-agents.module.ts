import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentOrchestrator } from './agents/agent-orchestrator';
import { PiiShieldService } from './services/pii-shield.service';

@Module({
  imports: [ConfigModule],
  providers: [AgentOrchestrator, PiiShieldService],
  exports: [AgentOrchestrator, PiiShieldService],
})
export class AiAgentsModule {}
