import { IsString, IsOptional, IsNumber, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertProductChannelDto {
  @IsString()
  channelId: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpsertBundleItemDto {
  @IsString()
  variantId: string;

  @IsNumber()
  quantity: number;
}

export class UpsertProductDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertProductChannelDto)
  @IsOptional()
  channels?: UpsertProductChannelDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertBundleItemDto)
  @IsOptional()
  bundleItems?: UpsertBundleItemDto[];
}
