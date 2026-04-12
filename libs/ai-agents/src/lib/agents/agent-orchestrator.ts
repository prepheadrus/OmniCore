import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';
import { AgentState, AgentStateType } from '../state/agent.state';
import { PiiShieldService } from '../services/pii-shield.service';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { GatewayTimeoutException } from '@nestjs/common';

@Injectable()
export class AgentOrchestrator {
  private readonly logger = new Logger(AgentOrchestrator.name);
  private llm: ChatGoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private piiShieldService: PiiShieldService,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY') || process.env['GEMINI_API_KEY'],
      model: 'gemini-3-flash-preview',
      temperature: 0,
      maxRetries: 0,
      verbose: true,
    });
  }

  // Define nodes

  private async supervisorNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
    const messages = state.messages;
    if (messages.length === 0) return { next: 'FINISH' };

    const lastMessage = messages[messages.length - 1];

    // Redact incoming user message
    let redactedContent = lastMessage.content as string;
    if (lastMessage instanceof HumanMessage) {
        redactedContent = this.piiShieldService.redact(lastMessage.content as string, state.piiVault);
    }

    const systemPrompt = `You are a supervisor routing customer queries.
Route to 'TOOL' if the query is about order status, cancellation, or address change.
Route to 'RAG' if the query is about product features, return policies, or warranty.
Route to 'CHAT' if it's just a greeting, casual conversation, or ending the conversation.
Do NOT output anything else. No chatting, no explanations.`;

    const routingSchema = z.object({
      next: z.enum(['RAG', 'TOOL', 'CHAT']).describe("The next agent to route to."),
    });

    const structuredLlm = this.llm.withStructuredOutput(routingSchema);

    try {
      const response = await structuredLlm.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(redactedContent)
      ]);

      // Ensure the human message is updated with redacted content in the state
      return {
          next: response.next,
          piiVault: state.piiVault // returning to trigger the reducer if necessary, though it mutates in redact
      };
    } catch (error: any) {
      this.logger.error(`Error invoking LLM in supervisorNode: ${error.message}`, error.stack);
      throw error; // Rethrow so the global exception filter can catch it and return 500
    }
  }

  private async ragNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
    // Mock RAG node
    return {
        messages: [new AIMessage("RAG_RESPONSE_MOCK")]
    };
  }

  private async toolNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
     // Mock Tool node
     return {
        messages: [new AIMessage("TOOL_RESPONSE_MOCK")]
    };
  }

  private async chatNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    const systemPrompt = `You are a friendly and polite customer service assistant for OmniCore.
Please respond to the user in Turkish naturally and politely.
Keep the response brief, helpful, and friendly.`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        lastMessage
      ]);

      return {
        messages: [response]
      };
    } catch (error: any) {
      this.logger.error(`Error invoking LLM in chatNode: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async finishNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
      // Restore the final message if it exists
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage instanceof AIMessage) {
          const restoredContent = this.piiShieldService.restore(lastMessage.content as string, state.piiVault);
          return {
              messages: [new AIMessage(restoredContent)],
              next: 'END'
          };
      }
      return { next: 'END' };
  }

  public async processChat(message: string): Promise<string> {
      const graph = this.createGraph();
      const config = { configurable: { thread_id: '1' } };

      const initialState = {
          messages: [new HumanMessage(message)],
          piiVault: {},
      };

      this.logger.debug('State initialized');
      this.logger.debug('Calling Gemini API (graph.invoke)...');

      const abortController = new AbortController();
      const configWithSignal = { ...config, signal: abortController.signal };
      let timeoutId: NodeJS.Timeout;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          abortController.abort(); // Cancel the underlying LangChain execution
          reject(new GatewayTimeoutException('Yapay zeka servisi yanıt vermedi (Zaman Aşımı). Lütfen tekrar deneyin.'));
        }, 30000);
      });

      try {
        const result = await Promise.race([
          graph.invoke(initialState, configWithSignal),
          timeoutPromise
        ]);
        clearTimeout(timeoutId!); // Clear the timer to avoid memory leaks
        this.logger.debug('Received response from Gemini...');

        const lastMessage = result.messages[result.messages.length - 1];

        // Ensure we only return the content of the final AIMessage, never a routing JSON
        if (lastMessage && lastMessage instanceof AIMessage) {
            const content = lastMessage.content;
            return typeof content === 'string' ? content : 'No response generated.';
        }

        return 'No response generated.';
      } catch (error: any) {
        this.logger.error('Error parsing LLM response or during graph execution', error?.stack || error);
        throw error;
      }
  }

  public createGraph() {
    const builder = new StateGraph(AgentState)
      .addNode('supervisor', this.supervisorNode.bind(this))
      .addNode('RAG', this.ragNode.bind(this))
      .addNode('TOOL', this.toolNode.bind(this))
      .addNode('CHAT', this.chatNode.bind(this))
      .addNode('FINISH', this.finishNode.bind(this))

      // Connect START to supervisor
      .addEdge(START, 'supervisor')

      // Conditional routing from supervisor
      .addConditionalEdges('supervisor', (state) => state.next, {
        RAG: 'RAG',
        TOOL: 'TOOL',
        CHAT: 'CHAT',
      })

      // All nodes go to finish eventually
      .addEdge('RAG', 'FINISH')
      .addEdge('TOOL', 'FINISH')
      .addEdge('CHAT', 'FINISH')

      .addEdge('FINISH', END);

    return builder.compile();
  }
}
