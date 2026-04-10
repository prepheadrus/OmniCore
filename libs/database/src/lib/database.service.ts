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
    const prisma = this.prisma; // Prisma istemcisini scope içine alıyoruz

    return prisma.$extends({
      query: {
        $allModels: {
          // Arrow function kullanarak 'this' bağlamı sorununu çözüyoruz
          $allOperations: async ({ model, operation, args, query }) => {
            const channelId = cls.get('app.channel_id');

            if (!channelId) {
              throw new UnauthorizedException('Database context error: channel_id is missing. Context-free database access is not allowed.');
            }

            // executeRaw ile SQL Injection'a karşı daha güvenli şablon dizisi kullanıyoruz
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.channel_id', ${channelId}, TRUE)`,
              query(args)
            ]);

            return result;
          },
        },
      },
    });
  }
}
