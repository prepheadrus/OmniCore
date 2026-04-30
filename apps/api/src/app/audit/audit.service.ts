import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.client.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
