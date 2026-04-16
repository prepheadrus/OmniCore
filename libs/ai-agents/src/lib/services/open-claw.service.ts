import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class OpenClawService {
  constructor(private configService: ConfigService) {}

  getModel(): ChatOpenAI {
    const baseUrl = this.configService.get<string>('OPENCLAW_BASE_URL') || process.env['OPENCLAW_BASE_URL'];
    const apiKey = this.configService.get<string>('OPENCLAW_API_KEY') || process.env['OPENCLAW_API_KEY'];

    return new ChatOpenAI({
      openAIApiKey: apiKey,
      configuration: {
        baseURL: baseUrl ? `${baseUrl}/v1` : undefined,
      },
      modelName: 'openclaw-model', // default fallback if needed
      temperature: 0,
      maxRetries: 0,
    });
  }
}
