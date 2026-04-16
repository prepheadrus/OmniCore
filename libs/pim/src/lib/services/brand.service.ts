import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';

@Injectable()
export class BrandService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getBrands() {
    return this.databaseService.client.brand.findMany();
  }

  async createBrand(data: any) {
    return this.databaseService.client.brand.create({
      data,
    });
  }
}
