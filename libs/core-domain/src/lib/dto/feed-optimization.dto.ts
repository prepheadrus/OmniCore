import { IsString, IsBoolean, IsOptional, IsInt, IsObject } from 'class-validator';

export class CreateContentRuleDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  channelName?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  template?: string;

  @IsObject()
  @IsOptional()
  variables?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  priority?: number;
}

export class UpdateContentRuleDto extends CreateContentRuleDto {}

export class CreateFeedQualityRuleDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  field?: string;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  channelName?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFeedQualityRuleDto extends CreateFeedQualityRuleDto {}
