import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandProtectionService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(params: { type?: string; severity?: string; status?: string }) {
    const { type, severity, status } = params;
    return this.db.client.brandProtectionAlert.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(severity ? { severity } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.BrandProtectionAlertCreateInput) {
    return this.db.client.brandProtectionAlert.create({
      data,
    });
  }

  async update(id: string, data: Prisma.BrandProtectionAlertUpdateInput) {
    return this.db.client.brandProtectionAlert.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.db.client.brandProtectionAlert.delete({
      where: { id },
    });
  }
}
