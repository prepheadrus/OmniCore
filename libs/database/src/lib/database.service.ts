import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

// Normally we'd inject SemanticCacheService, but it is in another library (ai-agents) which could cause circular dependency.
// Instead, we will emit an event or just do a simple module approach. For simplicity, we can do dynamic import or events.
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  public client: ReturnType<typeof this.createExtendedClient>;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private readonly cls: ClsService,
    private eventEmitter: EventEmitter2
  ) {
    this.prisma = new PrismaClient();
    this.client = this.createExtendedClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  private createExtendedClient() {
    const cls = this.cls;
    const prisma = this.prisma; // Prisma istemcisini scope içine alıyoruz

    return prisma.$extends({
      query: {
        $allModels: {
          // Arrow function kullanarak 'this' bağlamı sorununu çözüyoruz
          $allOperations: async ({ model, operation, args, query }: any) => {
            const channelId = cls.get('app.channel_id');

            if (!channelId) {
              throw new UnauthorizedException(
                'Database context error: channel_id is missing. Context-free database access is not allowed.',
              );
            }

            // Execute the query directly without a nested transaction to prevent deadlocks
            const result = await query(args);

            // SEMANTIC CACHE INVALIDATION LOGIC FOR PRODUCT
            if (model === 'Product' && ['update', 'updateMany'].includes(operation)) {
              const data = args.data as any;
              // Check if fields that affect semantic meaning were changed
              if (data.name !== undefined || data.description !== undefined || data.attributes !== undefined) {
                 // For simplicity, handle update. updateMany requires more complex tracking.
                 if (operation === 'update' && result) {
                    const product = result as any;
                    this.logger.log(`Emitting cache invalidation for product: ${product.id}`);
                    this.eventEmitter.emit('product.cache.invalidate', product.id);
                 }
              }
            }

            return result;
          },
        },
      },
    });
  }
}
