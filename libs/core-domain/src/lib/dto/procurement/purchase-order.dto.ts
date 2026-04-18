import { IsString, IsEnum, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIAL_RECEIPT = 'PARTIAL_RECEIPT',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

export class CreatePurchaseOrderItemDto {
  @IsString()
  productVariantId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  supplierId: string;

  @IsString()
  channelId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderStatusDto {
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;
}
