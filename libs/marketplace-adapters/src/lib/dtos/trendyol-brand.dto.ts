import { IsNumber, IsString } from 'class-validator';

export class TrendyolBrandDto {
  @IsNumber()
  id!: number;

  @IsString()
  name!: string;
}

export class TrendyolBrandsResponseDto {
  brands!: TrendyolBrandDto[];
}
