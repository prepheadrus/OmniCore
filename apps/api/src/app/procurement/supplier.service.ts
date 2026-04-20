import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreateSupplierDto, UpdateSupplierDto } from '@omnicore/core-domain';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class SupplierService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cls: ClsService,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.databaseService.client.$transaction(async (tx) => {
      const channelId = this.cls.get('app.channel_id');
      if (channelId) {
        await tx.$executeRaw`SELECT set_config('app.channel_id', ${channelId}, TRUE)`;
      }
      return tx.supplier.create({
        data: {
          ...createSupplierDto,
          channelId: channelId || createSupplierDto.channelId, // Override DTO with Context
        },
      });
    });
  }

  async findAll() {
    return this.databaseService.client.$transaction(async (tx) => {
      const channelId = this.cls.get('app.channel_id');
      if (channelId) {
        await tx.$executeRaw`SELECT set_config('app.channel_id', ${channelId}, TRUE)`;
      }
      return tx.supplier.findMany({
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async findOne(id: string) {
    return this.databaseService.client.$transaction(async (tx) => {
      const channelId = this.cls.get('app.channel_id');
      if (channelId) {
        await tx.$executeRaw`SELECT set_config('app.channel_id', ${channelId}, TRUE)`;
      }
      const supplier = await tx.supplier.findUnique({
        where: { id },
      });

      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      return supplier;
    });
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    return this.databaseService.client.$transaction(async (tx) => {
      const channelId = this.cls.get('app.channel_id');
      if (channelId) {
        await tx.$executeRaw`SELECT set_config('app.channel_id', ${channelId}, TRUE)`;
      }

      const supplier = await tx.supplier.findUnique({
        where: { id },
      });

      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      return tx.supplier.update({
        where: { id },
        data: updateSupplierDto,
      });
    });
  }

  async remove(id: string) {
    return this.databaseService.client.$transaction(async (tx) => {
      const channelId = this.cls.get('app.channel_id');
      if (channelId) {
        await tx.$executeRaw`SELECT set_config('app.channel_id', ${channelId}, TRUE)`;
      }

      const supplier = await tx.supplier.findUnique({
        where: { id },
      });

      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      return tx.supplier.delete({
        where: { id },
      });
    });
  }
}
