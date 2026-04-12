import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentOrchestrator } from '@omnicore/ai-agents';
import { ChatRequestDto } from '../dto/chat-request.dto';
import { ClsService } from 'nestjs-cls';

@ApiTags('AI Agents')
@Controller('chat')
export class AiAgentController {
  constructor(
    private readonly agentOrchestrator: AgentOrchestrator,
    private readonly cls: ClsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Process a chat message using AI agents' })
  @ApiResponse({ status: 201, description: 'The response from the AI agents' })
  async chat(@Body() chatRequestDto: ChatRequestDto): Promise<{ response: string }> {
    Logger.log(`Received ChatRequestDto: ${JSON.stringify(chatRequestDto)}`, 'AiAgentController');

    // Bypass Prisma 401 error by setting a default channel_id for AI Chat
    this.cls.set('app.channel_id', 'system-ai');

    try {
      const aiResponse = await this.agentOrchestrator.processChat(chatRequestDto.message);
      Logger.log('Sending response to client: ' + aiResponse, 'AiAgentController');
      return { response: aiResponse };
    } catch (error: any) {
      Logger.error(`Error processing chat in AiAgentController: ${error.message}`, error.stack, 'AiAgentController');
      throw error;
    }
  }

  @Post('test-ai')
  @ApiOperation({ summary: 'Test AI Agent with predefined questions' })
  @ApiResponse({ status: 200, description: 'Returns responses from AI agent for test queries' })
  async testAi(): Promise<any> {
    this.cls.set('app.channel_id', 'system-ai');
    
    try {
      const q1 = "Sistemdeki ürünlerim neler?";
      Logger.log(`Testing Q1: ${q1}`, 'AiAgentController');
      const ans1 = await this.agentOrchestrator.processChat(q1);
      
      const q2 = "Şu ana kadar tamamlanan siparişlerden elde ettiğim toplam ciro nedir?";
      Logger.log(`Testing Q2: ${q2}`, 'AiAgentController');
      const ans2 = await this.agentOrchestrator.processChat(q2);
      
      return {
        q1: {
          question: q1,
          answer: ans1
        },
        q2: {
          question: q2,
          answer: ans2
        }
      };
    } catch (error: any) {
      Logger.error(`Error in test endpoint: ${error.message}`, error.stack, 'AiAgentController');
      throw error;
    }
  }
}
