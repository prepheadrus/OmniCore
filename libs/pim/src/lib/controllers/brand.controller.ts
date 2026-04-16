import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BrandService } from '../services/brand.service';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async getBrands() {
    return this.brandService.getBrands();
  }

  @Post()
  async createBrand(@Body() data: any) {
    return this.brandService.createBrand(data);
  }
}
