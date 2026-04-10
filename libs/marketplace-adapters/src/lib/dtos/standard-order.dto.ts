import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class StandardOrderDto {
  @IsString()
  remoteOrderId!: string;

  @IsString()
  orderNumber!: string;

  @IsNumber()
  totalAmount!: number;

  @IsString()
  @IsOptional()
  currency: string = 'TRY';

  @IsString()
  customerName!: string;

  @IsString()
  status!: string;

  @IsDate()
  @Type(() => Date)
  createdAt!: Date;
}
