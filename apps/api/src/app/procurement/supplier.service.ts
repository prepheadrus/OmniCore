import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreateSupplierDto, UpdateSupplierDto } from '@omnicore/core-domain';

@Injectable()
export class SupplierService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.databaseService.client.$transaction(async (tx) => {
      return tx.supplier.create({
        data: createSupplierDto,
      });
    });
  }

  async findAll(query?: { search?: string; isActive?: boolean; isDropshipper?: boolean }) {
    return this.databaseService.client.$transaction(async (tx) => {
      const where: import("@prisma/client").Prisma.SupplierWhereInput = {};
      if (query?.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { taxNumber: { contains: query.search, mode: 'insensitive' } },
          { contactName: { contains: query.search, mode: 'insensitive' } },
        ];
      }
      if (query?.isActive !== undefined) {
        where.isActive = String(query.isActive) === 'true';
      }
      if (query?.isDropshipper !== undefined) {
        where.isDropshipper = String(query.isDropshipper) === 'true';
      }

      return tx.supplier.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async findOne(id: string) {
    return this.databaseService.client.$transaction(async (tx) => {
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
      const supplier = await tx.supplier.findUnique({
        where: { id },
        include: { purchaseOrders: true }
      });

      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }

      if (supplier.purchaseOrders && supplier.purchaseOrders.length > 0) {
        throw new BadRequestException("Bu tedarikçinin geçmiş işlemleri bulunduğu için silinemez. Lütfen pasife almayı deneyin.");
      }

      return tx.supplier.delete({
        where: { id },
      });
    });
  }
}
