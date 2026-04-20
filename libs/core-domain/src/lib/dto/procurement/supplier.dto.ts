import { IsString, IsOptional, IsEmail, IsInt, IsBoolean } from 'class-validator';

export class CreateSupplierDto {
  constructor() {
    this.name = '';
    this.channelId = '';
  }
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  supplierGroup?: string;

  @IsString()
  channelId: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  streetAddress?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsString()
  @IsOptional()
  taxOffice?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  iban?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsInt()
  @IsOptional()
  paymentTerms?: number;

  @IsString()
  @IsOptional()
  eInvoiceAlias?: string;

  @IsString()
  @IsOptional()
  naceCode?: string;

  @IsString()
  @IsOptional()
  mersisNo?: string;

  @IsString()
  @IsOptional()
  tradeRegistryNo?: string;

  @IsInt()
  @IsOptional()
  leadTimeInDays?: number;

  @IsInt()
  @IsOptional()
  minimumOrderQuantity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDropshipper?: boolean;

  @IsString()
  @IsOptional()
  returnAddress?: string;

  @IsString()
  @IsOptional()
  externalSellerId?: string;

  @IsInt()
  @IsOptional()
  performanceScore?: number;
}

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  supplierGroup?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  streetAddress?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsString()
  @IsOptional()
  taxOffice?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  iban?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsInt()
  @IsOptional()
  paymentTerms?: number;

  @IsString()
  @IsOptional()
  eInvoiceAlias?: string;

  @IsString()
  @IsOptional()
  naceCode?: string;

  @IsString()
  @IsOptional()
  mersisNo?: string;

  @IsString()
  @IsOptional()
  tradeRegistryNo?: string;

  @IsInt()
  @IsOptional()
  leadTimeInDays?: number;

  @IsInt()
  @IsOptional()
  minimumOrderQuantity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isDropshipper?: boolean;

  @IsString()
  @IsOptional()
  returnAddress?: string;

  @IsString()
  @IsOptional()
  externalSellerId?: string;

  @IsInt()
  @IsOptional()
  performanceScore?: number;
}
