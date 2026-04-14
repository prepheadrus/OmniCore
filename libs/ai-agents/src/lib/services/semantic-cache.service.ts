import { Injectable, Logger } from '@nestjs/common';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RedisVectorStore } from '@langchain/redis';
import { Document } from '@langchain/core/documents';

@Injectable()
export class SemanticCacheService {
  private readonly logger = new Logger(SemanticCacheService.name);
  private readonly redisClient: RedisClientType;
  private readonly embeddings: GoogleGenerativeAIEmbeddings;
  private vectorStore: RedisVectorStore | null = null;
  private isVectorStoreInitialized = false;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.redisClient = createClient({
      url: `redis://${host}:${port}`,
    }) as RedisClientType;

    this.redisClient.connect().catch((err) => {
        this.logger.error('Redis connection error', err);
    });

    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: this.configService.get<string>('GEMINI_API_KEY') || process.env['GEMINI_API_KEY'],
      model: 'text-embedding-004',
    });

    this.initVectorStore();
  }

  private async initVectorStore() {
    try {
      this.vectorStore = new RedisVectorStore(this.embeddings, {
        redisClient: this.redisClient as any,
        indexName: 'omnicore_semantic_cache',
        keyPrefix: 'cache:product:',
        customSchema: {
          productId: {
            type: "tag"
          },
          answer: {
            type: "text"
          }
        } as any // For newer @langchain/redis custom schema mapping
      });
      // Will attempt to create index if it doesn't exist
      await this.vectorStore.createIndex();
      this.isVectorStoreInitialized = true;
      this.logger.log('Redis Vector Store initialized for semantic cache');
    } catch (error) {
      // Create index might fail if it already exists or if Redis doesn't support Search/JSON (redis-stack needed)
      this.logger.warn(`Could not create Redis vector index (it might already exist or missing Redis Stack): ${error}`);
      this.isVectorStoreInitialized = true;
    }
  }

  async invalidateCache(productId: string): Promise<void> {
    try {
      // Use RedisSearch to find matching documents efficiently instead of KEYS + Iteration
      // The VectorStore creates an index named 'omnicore_semantic_cache'.
      // The filter syntax for exact match on tag/text fields:
      const query = `@productId:{${productId.replace(/-/g, '\\-')}}`;

      const searchResults = await this.redisClient.ft.search('omnicore_semantic_cache', query, {
         RETURN: [] // Return only keys
      });

      if (searchResults.total > 0) {
        // RediSearch returns the keys in the `documents` array as `id`
        const keysToDelete = searchResults.documents.map(doc => doc.id);

        // Delete all matching keys
        await this.redisClient.del(keysToDelete);
        this.logger.log(`Invalidated ${keysToDelete.length} semantic cache entries for product: ${productId}`);
      } else {
        this.logger.log(`No semantic cache entries found to invalidate for product: ${productId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate cache for product: ${productId}`, error);
    }
  }

  async searchSimilar(productId: string, query: string, topK = 1): Promise<[Document, number][]> {
    if (!this.vectorStore || !this.isVectorStoreInitialized) return [];

    try {
      // Filter by productId using Redis Search filter syntax
      const filter = [`@productId:{${productId.replace(/-/g, '\\-')}}`];
      // Use similaritySearchWithScore to get distance metric
      const results = await this.vectorStore.similaritySearchWithScore(query, topK, filter);

      return results;
    } catch (error) {
       this.logger.warn(`Failed to search semantic cache: ${error}`);
       return [];
    }
  }

  async storeAnswer(productId: string, question: string, answer: string): Promise<void> {
    if (!this.vectorStore || !this.isVectorStoreInitialized) return;

    try {
      const doc = new Document({
        pageContent: question,
        metadata: {
          productId: productId,
          answer: answer,
          type: 'semantic_cache'
        }
      });

      await this.vectorStore.addDocuments([doc]);
      this.logger.log(`Stored answer in semantic cache for product: ${productId}`);
    } catch (error) {
      this.logger.error(`Failed to store answer in semantic cache for product: ${productId}`, error);
    }
  }
}
