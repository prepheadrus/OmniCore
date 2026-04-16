import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AgentStateType } from '../state/agent.state';

export const createSeoDescriptionNode = (llm: BaseChatModel) => {
  return async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    if (!state.productContext || Object.keys(state.productContext).length === 0) {
      return {
        messages: [
          new AIMessage('Lütfen açıklama oluşturmamı istediğiniz ürünün özelliklerini (ad, renk, vb.) sağlayın.'),
        ],
        next: 'FINISH',
      };
    }

    const systemPrompt = `Sen e-ticaret alanında uzman bir metin yazarısın. Sana verilen şu ürün bilgilerine dayanarak, müşteriyi satın almaya ikna edecek, Türkçe ve SEO uyumlu, 2 paragraflık bir ürün açıklaması yaz.

Ürün Bilgileri:
${JSON.stringify(state.productContext, null, 2)}
`;

    try {
      const response = await llm.invoke([
        new SystemMessage(systemPrompt),
      ]);

      return {
        messages: [response],
        next: 'FINISH',
      };
    } catch (error) {
      console.error('Error in seoDescriptionNode:', error);
      throw error;
    }
  };
};
