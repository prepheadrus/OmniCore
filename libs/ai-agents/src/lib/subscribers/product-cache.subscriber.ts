import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SemanticCacheService } from '../services/semantic-cache.service';

@Injectable()
export class ProductCacheSubscriber {
  constructor(private semanticCacheService: SemanticCacheService) {}

  @OnEvent('product.cache.invalidate')
  handleProductCacheInvalidationEvent(productId: string) {
    this.semanticCacheService.invalidateCache(productId);
  }
}
