import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
  Min,
  Max,
  IsDateString,
  IsUUID
} from 'class-validator';

export enum PurchaseInvoiceStatusDto {
  DRAFT = 'DRAFT',
  MATCHING_PENDING = 'MATCHING_PENDING',
  COMPLETED = 'COMPLETED',
}

export enum PurchaseInvoiceType {
  E_INVOICE = 'E_INVOICE',
  E_ARCHIVE = 'E_ARCHIVE',
}

export class PurchaseInvoiceItemDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @IsNumber()
  totalAmount!: number;

  @IsBoolean()
  @IsOptional()
  isMatched?: boolean;

  @IsString()
  @IsOptional()
  matchedSku?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;
}

export class CreatePurchaseInvoiceDto {
  @IsString()
  documentNo!: string;

  @IsString()
  supplierId!: string;

  @IsDateString()
  date!: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(PurchaseInvoiceType)
  type!: PurchaseInvoiceType;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsNumber()
  @IsOptional()
  subTotal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  generalDiscountPercent?: number;

  @IsNumber()
  @IsOptional()
  generalDiscountAmount?: number;

  @IsNumber()
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  roundingDifference?: number;

  @IsNumber()
  grandTotal!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseInvoiceItemDto)
  items!: PurchaseInvoiceItemDto[];

  @IsEnum(PurchaseInvoiceStatusDto)
  @IsOptional()
  status?: PurchaseInvoiceStatusDto;
}

export class GetPurchaseInvoicesFilterDto {
  @IsString()
  @IsOptional()
  supplierId?: string;

  @IsString()
  @IsOptional()
  documentNo?: string;

  @IsEnum(PurchaseInvoiceStatusDto)
  @IsOptional()
  status?: PurchaseInvoiceStatusDto;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
