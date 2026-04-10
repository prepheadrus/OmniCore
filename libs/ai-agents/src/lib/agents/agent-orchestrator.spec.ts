import { AgentOrchestrator } from './agent-orchestrator';
import { ConfigService } from '@nestjs/config';
import { PiiShieldService } from '../services/pii-shield.service';
import { HumanMessage } from '@langchain/core/messages';
import { AgentStateType } from '../state/agent.state';

describe('AgentOrchestrator', () => {
  let orchestrator: AgentOrchestrator;
  let mockConfigService: Partial<ConfigService>;
  let piiShieldService: PiiShieldService;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('mock-api-key'),
    };
    piiShieldService = new PiiShieldService();
    orchestrator = new AgentOrchestrator(
      mockConfigService as ConfigService,
      piiShieldService
    );

    // Mock ChatOpenAI and its withStructuredOutput
    const mockStructuredLlmInvoke = jest.fn();
    const mockStructuredLlm = {
      invoke: mockStructuredLlmInvoke,
    };
    (orchestrator as any).llm = {
      withStructuredOutput: jest.fn().mockReturnValue(mockStructuredLlm),
    };
  });

  it('should route to FINISH when there are no messages', async () => {
    const state: AgentStateType = {
      messages: [],
      next: '',
      piiVault: {},
    };

    const result = await (orchestrator as any).supervisorNode(state);
    expect(result.next).toBe('FINISH');
  });

  it('should route to RAG for product questions', async () => {
    const state: AgentStateType = {
      messages: [new HumanMessage('Ürün özellikleri nelerdir?')],
      next: '',
      piiVault: {},
    };

    // Set up the mock response to return RAG
    const mockInvoke = (orchestrator as any).llm.withStructuredOutput().invoke;
    mockInvoke.mockResolvedValue({ next: 'RAG' });

    const result = await (orchestrator as any).supervisorNode(state);

    expect(result.next).toBe('RAG');
    expect(mockInvoke).toHaveBeenCalled();
  });

  it('should redact human messages before sending to LLM', async () => {
    const state: AgentStateType = {
      messages: [new HumanMessage('Kargom test@example.com adresine gelsin')],
      next: '',
      piiVault: {},
    };

    const mockInvoke = (orchestrator as any).llm.withStructuredOutput().invoke;
    mockInvoke.mockResolvedValue({ next: 'TOOL' });

    const redactSpy = jest.spyOn(piiShieldService, 'redact');

    await (orchestrator as any).supervisorNode(state);

    expect(redactSpy).toHaveBeenCalledWith('Kargom test@example.com adresine gelsin', state.piiVault);
  });

  it('should create and compile the graph without errors', () => {
      const graph = orchestrator.createGraph();
      expect(graph).toBeDefined();
  });
});
