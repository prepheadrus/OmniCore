import { IsString, IsOptional, IsEnum, IsInt, IsObject } from 'class-validator';

export class CreateFeedDto {
  @IsString()
  name = '';

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, any>;
}

export class UpdateFeedDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, any>;
}
