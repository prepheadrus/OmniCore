import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { IOrderSync } from '../interfaces/order-sync.interface';
import { IProductSync } from '../interfaces/product-sync.interface';
import { StandardOrderDto } from '../dtos/standard-order.dto';
import { StandardProductDto } from '../dtos/standard-product.dto';
import { TrendyolBrandDto, TrendyolBrandsResponseDto } from '../dtos/trendyol-brand.dto';

@Injectable()
export class TrendyolAdapter implements IOrderSync, IProductSync {
  private readonly logger = new Logger(TrendyolAdapter.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchOrders(
    startDate: Date,
    endDate: Date,
  ): Promise<StandardOrderDto[]> {
    return [];
  }

  async fetchProducts(
    limit?: number,
    offset?: number,
  ): Promise<StandardProductDto[]> {
    return [];
  }

  async getBrands(): Promise<TrendyolBrandsResponseDto> {
    const apiKey = this.configService.get<string>('TRENDYOL_API_KEY');
    const apiSecret = this.configService.get<string>('TRENDYOL_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('Trendyol API credentials are not configured');
    }

    const authHeader = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<TrendyolBrandsResponseDto>('https://api.trendyol.com/sapigw/brands', {
          headers: {
            Authorization: authHeader,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch brands from Trendyol', error);
      throw error;
    }
  }
}
