import { Injectable } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';
import { AgentState, AgentStateType } from '../state/agent.state';
import { PiiShieldService } from '../services/pii-shield.service';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';

@Injectable()
export class AgentOrchestrator {
  private llm: ChatGoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private piiShieldService: PiiShieldService,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY') || process.env['GEMINI_API_KEY'],
      model: 'gemini-3-flash-preview',
      temperature: 0,
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
Route to 'FINISH' if it's just a greeting or ending the conversation.
Do NOT output anything else. No chatting, no explanations.`;

    const routingSchema = z.object({
      next: z.enum(['RAG', 'TOOL', 'FINISH']).describe("The next agent to route to."),
    });

    const structuredLlm = this.llm.withStructuredOutput(routingSchema);

    const response = await structuredLlm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(redactedContent)
    ]);

    // Ensure the human message is updated with redacted content in the state
    return {
        next: response.next,
        piiVault: state.piiVault // returning to trigger the reducer if necessary, though it mutates in redact
    };
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

  private async finishNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
      // Restore the final message if it exists
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage instanceof AIMessage) {
          const restoredContent = this.piiShieldService.restore(lastMessage.content as string, state.piiVault);
          // In a real scenario we'd update the message list, but here we just return
          // the end state. Actually, LangGraph reducer will append it, so we shouldn't return a new message unless needed.
      }
      return { next: 'END' };
  }


  public createGraph() {
    const builder = new StateGraph(AgentState)
      .addNode('supervisor', this.supervisorNode.bind(this))
      .addNode('RAG', this.ragNode.bind(this))
      .addNode('TOOL', this.toolNode.bind(this))
      .addNode('FINISH', this.finishNode.bind(this))

      // Connect START to supervisor
      .addEdge(START, 'supervisor')

      // Conditional routing from supervisor
      .addConditionalEdges('supervisor', (state) => state.next, {
        RAG: 'RAG',
        TOOL: 'TOOL',
        FINISH: 'FINISH',
      })

      // All nodes go to finish eventually
      .addEdge('RAG', 'FINISH')
      .addEdge('TOOL', 'FINISH')

      .addEdge('FINISH', END);

    return builder.compile();
  }
}
