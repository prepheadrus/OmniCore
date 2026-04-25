import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryMappingDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceCat?: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsOptional()
  @IsString()
  targetCat?: string;
}

export class UpdateCategoryMappingDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceCat?: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsOptional()
  @IsString()
  targetCat?: string;
}
