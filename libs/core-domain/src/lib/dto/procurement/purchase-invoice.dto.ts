import { Type } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsArray
} from 'class-validator';

export enum PurchaseInvoiceStatus {
  DRAFT = 'DRAFT',
  MATCHING_PENDING = 'MATCHING_PENDING',
  COMPLETED = 'COMPLETED',
}

export enum PurchaseInvoiceType {
  E_INVOICE = 'E_INVOICE',
  PRINTED = 'PRINTED',
}

export class CreatePurchaseInvoiceItemDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsNumber()
  lineTotal: number;

  @IsOptional()
  @IsUUID()
  productId?: string;
}

export class CreatePurchaseInvoiceDto {
  @IsString()
  invoiceNumber: string;

  @IsUUID()
  supplierId: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsEnum(PurchaseInvoiceType)
  type: PurchaseInvoiceType;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @IsNumber()
  subTotal: number;

  @IsNumber()
  discountTotal: number;

  @IsNumber()
  taxTotal: number;

  @IsOptional()
  @IsNumber()
  roundingDifference?: number;

  @IsNumber()
  grandTotal: number;

  @IsOptional()
  @IsEnum(PurchaseInvoiceStatus)
  status?: PurchaseInvoiceStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  channelId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceItemDto)
  items: CreatePurchaseInvoiceItemDto[];
}
