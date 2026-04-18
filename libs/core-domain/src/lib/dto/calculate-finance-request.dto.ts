import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateFinanceRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  costPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  commissionAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shippingCost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountAmount?: number;
}
