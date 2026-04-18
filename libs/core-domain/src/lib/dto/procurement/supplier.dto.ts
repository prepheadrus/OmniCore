import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  channelId: string;
}

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
