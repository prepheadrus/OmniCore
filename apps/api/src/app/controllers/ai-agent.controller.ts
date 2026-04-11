import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentOrchestrator } from '@omnicore/ai-agents';
import { ChatRequestDto } from '../dto/chat-request.dto';
import { HumanMessage } from '@langchain/core/messages';

@ApiTags('AI Agents')
@Controller('chat')
export class AiAgentController {
  constructor(private readonly agentOrchestrator: AgentOrchestrator) {}

  @Post()
  @ApiOperation({ summary: 'Process a chat message using AI agents' })
  @ApiResponse({ status: 201, description: 'The response from the AI agents' })
  async chat(@Body() chatRequestDto: ChatRequestDto) {
    Logger.log(`Received ChatRequestDto: ${JSON.stringify(chatRequestDto)}`, 'AiAgentController');

    const graph = this.agentOrchestrator.createGraph();
    const config = { configurable: { thread_id: '1' } };

    // Initial state setup with the new human message.
    const initialState = {
      messages: [new HumanMessage(chatRequestDto.message)],
      piiVault: {},
    };

    const result = await graph.invoke(initialState, config);

    // Extracted and restored message handled by the FINISH node and orchestrator
    // Here we just extract the last AIMessage content from the final state if available
    const lastMessage = result.messages[result.messages.length - 1];

    return {
      response: lastMessage?.content || 'No response generated.',
    };
  }
}
