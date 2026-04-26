import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, IsNotEmpty, IsArray } from 'class-validator';

export class CreateFeedTemplateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  fields?: any[];

  @IsOptional()
  @IsObject()
  requirements?: Record<string, any>;

  @IsOptional()
  @IsString()
  sampleUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsNumber()
  downloadCount?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;
}

export class UpdateFeedTemplateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  fields?: any[];

  @IsOptional()
  @IsObject()
  requirements?: Record<string, any>;

  @IsOptional()
  @IsString()
  sampleUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsNumber()
  downloadCount?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
