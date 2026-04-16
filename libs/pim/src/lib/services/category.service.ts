import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';

@Injectable()
export class CategoryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getCategories() {
    return this.databaseService.client.category.findMany({
      include: {
        children: true,
      },
    });
  }

  async createCategory(data: any) {
    return this.databaseService.client.category.create({
      data,
    });
  }
}
