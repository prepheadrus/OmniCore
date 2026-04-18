import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreateSupplierDto, UpdateSupplierDto } from '@omnicore/core-domain';

@Injectable()
export class SupplierService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    return this.databaseService.client.supplier.create({
      data: createSupplierDto,
    });
  }

  async findAll() {
    return this.databaseService.client.supplier.findMany();
  }

  async findOne(id: string) {
    const supplier = await this.databaseService.client.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id); // Ensure exists

    return this.databaseService.client.supplier.update({
      where: { id },
      data: updateSupplierDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists

    return this.databaseService.client.supplier.delete({
      where: { id },
    });
  }
}
