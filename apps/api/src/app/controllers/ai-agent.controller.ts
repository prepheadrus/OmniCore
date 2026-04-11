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
      return { response: aiResponse };
    } catch (error: any) {
      Logger.error(`Error processing chat in AiAgentController: ${error.message}`, error.stack, 'AiAgentController');
      throw error;
    }
  }
}
