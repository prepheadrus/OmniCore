import { IsNumber, IsString } from 'class-validator';

export class StandardProductDto {
  @IsString()
  remoteProductId!: string;

  @IsString()
  name!: string;

  @IsString()
  sku!: string;

  @IsNumber()
  price!: number;

  @IsNumber()
  stockQuantity!: number;

  @IsString()
  status!: string;
}
