import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ConfigService } from '@nestjs/config';
import { AgentState, AgentStateType } from '../state/agent.state';
import { PiiShieldService } from '../services/pii-shield.service';
import { SemanticCacheService } from '../services/semantic-cache.service';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { GatewayTimeoutException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { createSeoDescriptionNode } from '../nodes/seo-description.node';

@Injectable()
export class AgentOrchestrator {
  private readonly logger = new Logger(AgentOrchestrator.name);
  private llm: ChatGoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private piiShieldService: PiiShieldService,
    private databaseService: DatabaseService,
    private semanticCacheService: SemanticCacheService,
  ) {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY') || process.env['GEMINI_API_KEY'],
      model: 'gemini-2.5-flash',
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
Route to 'TOOL' if the query is strictly about price, stock, order status, cancellation, address change, or total revenue/ciro.
Route to 'CACHE_CHECK' if the query is about product features, durability, return policies, warranty, or listing existing products in the system.
Route to 'CHAT' if it's just a greeting, casual conversation, or ending the conversation.
Route to 'SEO_DESCRIPTION' if the query is explicitly asking to write a product description or create SEO compliant text for the product (e.g. "Bu ürün için bir açıklama yaz" or "SEO uyumlu metin oluştur").
Do NOT output anything else. No chatting, no explanations.`;

    const routingSchema = z.object({
      next: z.enum(['CACHE_CHECK', 'TOOL', 'CHAT', 'SEO_DESCRIPTION']).describe("The next agent to route to."),
      productId: z.string().optional().describe("If the query mentions a specific product by ID, extract it here.")
    });

    const structuredLlm = this.llm.withStructuredOutput(routingSchema);

    try {
      const response = await structuredLlm.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(redactedContent)
      ]);

      return {
          next: response.next,
          productId: response.productId,
          piiVault: state.piiVault, // returning to trigger the reducer if necessary, though it mutates in redact
      };
    } catch (error: any) {
      this.logger.error(`Error invoking LLM in supervisorNode: ${error.message}`, error.stack);
      throw error; // Rethrow so the global exception filter can catch it and return 500
    }
  }

  private async cacheCheckNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content as string;

    let productId = state.productId;
    if (!productId) {
      // If LLM couldn't extract a product ID, attempt to pick a default one or just use global
      // Note: Ideally, the user provides a specific product ID in real scenario.
      const products = await this.databaseService.client.product.findMany({ take: 1 });
      productId = products.length > 0 ? products[0].id : 'global';
    }

    const results = await this.semanticCacheService.searchSimilar(productId, query, 1);

    if (results && results.length > 0) {
       const [doc, score] = results[0];
       // Langchain Redis integration returns distance (0 = identical).
       // We assume < 0.25 is a good semantic match threshold.
       if (score < 0.25) {
         this.logger.log(`Semantic cache HIT for product ${productId} (Score: ${score})`);
         const cachedAnswer = doc.metadata['answer'] as string;
         return {
           messages: [new AIMessage(cachedAnswer)],
           next: 'FINISH'
         }
       } else {
         this.logger.log(`Semantic cache SCORE TOO HIGH (Miss) for product ${productId} (Score: ${score})`);
       }
    } else {
        this.logger.log(`Semantic cache MISS (No results) for product ${productId}. Routing to RAG.`);
    }

    return {
      next: 'RAG'
    }
  }

  private async ragNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    
    // Fetch products from database
    const products = await this.databaseService.client.product.findMany();
    
    const systemPrompt = `You are an AI assistant for OmniCore answering product related queries.
Here are the current products in the database:
${JSON.stringify(products, null, 2)}

Answer the user's question accurately based on this data. Respond in natural Turkish.
Keep your answer friendly and concise.`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        lastMessage
      ]);
      
      // Store in semantic cache
      let productId = state.productId;
      if (!productId) {
         productId = products.length > 0 ? products[0].id : 'global';
      }
      await this.semanticCacheService.storeAnswer(productId, lastMessage.content as string, response.content as string);

      return {
        messages: [response]
      };
    } catch (error: any) {
      this.logger.error(`Error invoking LLM in ragNode: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async toolNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
     const messages = state.messages;
     const lastMessage = messages[messages.length - 1];
     
     // Fetch completed orders from database and calculate revenue
     const completedOrders = await this.databaseService.client.order.findMany({
         where: { status: 'COMPLETED' }
     });
     const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
     
     const systemPrompt = `You are an AI assistant for OmniCore answering queries about orders and revenue.
Here is the calculated total revenue from completed orders: ${totalRevenue} TL.

Answer the user's question accurately based on this data. Respond in natural Turkish.
Keep your answer friendly and concise.`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage(systemPrompt),
        lastMessage
      ]);
      
      return {
        messages: [response]
      };
    } catch (error: any) {
      this.logger.error(`Error invoking LLM in toolNode: ${error.message}`, error.stack);
      throw error;
    }
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
        }, 90000);
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
      .addNode('CACHE_CHECK', this.cacheCheckNode.bind(this))
      .addNode('RAG', this.ragNode.bind(this))
      .addNode('TOOL', this.toolNode.bind(this))
      .addNode('CHAT', this.chatNode.bind(this))
      .addNode('SEO_DESCRIPTION', createSeoDescriptionNode(this.llm))
      .addNode('FINISH', this.finishNode.bind(this))

      // Connect START to supervisor
      .addEdge(START, 'supervisor')

      // Conditional routing from supervisor
      .addConditionalEdges('supervisor', (state) => state.next, {
        CACHE_CHECK: 'CACHE_CHECK',
        TOOL: 'TOOL',
        CHAT: 'CHAT',
        SEO_DESCRIPTION: 'SEO_DESCRIPTION',
      })

      // Conditional routing from CACHE_CHECK (either hits cache and goes FINISH, or misses and goes to RAG)
      .addConditionalEdges('CACHE_CHECK', (state) => state.next === 'FINISH' ? 'FINISH' : 'RAG', {
        FINISH: 'FINISH',
        RAG: 'RAG'
      })

      // All nodes go to finish eventually
      .addEdge('RAG', 'FINISH')
      .addEdge('TOOL', 'FINISH')
      .addEdge('CHAT', 'FINISH')
      .addEdge('SEO_DESCRIPTION', 'FINISH')

      .addEdge('FINISH', END);

    return builder.compile();
  }
}
