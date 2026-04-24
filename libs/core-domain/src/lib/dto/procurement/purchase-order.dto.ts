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
  constructor() {
    this.productVariantId = "";
    this.quantity = 0;
    this.unitCost = 0;
  }
  @IsString()
  productVariantId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  constructor() {
    this.supplierId = "";
    this.items = [];
  }
  @IsString()
  supplierId: string;

  @IsString()

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderStatusDto {
  constructor() {
    this.status = PurchaseOrderStatus.DRAFT;
  }
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;
}
