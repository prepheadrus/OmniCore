import { Injectable, OnModuleInit, OnModuleDestroy, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  public client: ReturnType<typeof this.createExtendedClient>;

  constructor(private readonly cls: ClsService) {
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

    return this.prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const channelId = cls.get('app.channel_id');

            if (!channelId) {
              throw new UnauthorizedException('Database context error: channel_id is missing. Context-free database access is not allowed.');
            }

            // Using sequential queries in a transaction ensures they execute on the same connection.
            const [, result] = await this.$transaction([
              this.$executeRawUnsafe(`SELECT set_config('app.channel_id', $1, TRUE)`, channelId),
              query(args)
            ]);

            return result;
          },
        },
      },
    });
  }
}
