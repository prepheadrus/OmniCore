import { IMarketplaceAdapter, AdapterConfig } from './types';
import { db } from '@/lib/db';
import { TrendyolAdapter } from './adapters/TrendyolAdapter';

export class AdapterFactory {
  static async getAdapter(integrationId: string): Promise<IMarketplaceAdapter | null> {
    const integration = await db.integration.findUnique({
      where: { id: integrationId }
    });

    if (!integration || integration.status !== 'connected') {
      return null;
    }

    const config: AdapterConfig = {
      apiKey: integration.apiKey,
      apiSecret: integration.apiSecret,
      shopUrl: integration.shopUrl,
    };

    switch (integration.platform.toLowerCase()) {
      case 'trendyol':
        return new TrendyolAdapter(config);
      default:
        console.warn(`Adapter not implemented for platform: ${integration.platform}`);
        return null;
    }
  }
}
