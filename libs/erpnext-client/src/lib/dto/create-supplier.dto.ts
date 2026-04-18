import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  supplier_name: string;

  @IsString()
  @IsOptional()
  supplier_group?: string;
}
