import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseReceiptItemDto {
  @IsString()
  @IsNotEmpty()
  item_code: string;

  @IsNumber()
  @IsNotEmpty()
  qty: number;

  @IsNumber()
  @IsNotEmpty()
  rate: number;

  @IsString()
  @IsOptional()
  purchase_order?: string;
}

export class CreatePurchaseReceiptDto {
  @IsString()
  @IsNotEmpty()
  supplier: string;

  @IsNotEmpty()
  posting_date: string | Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseReceiptItemDto)
  items: PurchaseReceiptItemDto[];
}
