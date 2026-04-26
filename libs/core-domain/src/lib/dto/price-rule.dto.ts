import { z } from 'zod';
import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

// Pricing Rule Schema (used in the UI component index.tsx currently)
export const PriceRuleSchema = z.object({
  name: z.string().min(1, 'Kural adı zorunludur'),
  description: z.string().optional().default(''),
  type: z.enum(['markup', 'discount', 'match', 'max_price']).default('markup'),
  baseField: z.enum(['cost', 'price', 'competitor_price']).default('cost'),
  value: z.coerce.number().min(0).default(0),
  valueType: z.enum(['percentage', 'fixed']).default('percentage'),
  minMargin: z.coerce.number().min(0).default(0),
  maxPrice: z.coerce.number().min(0).default(0),
  roundTo: z.coerce.number().default(0),
  marketplace: z.string().default('all'),
  categoryId: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  priority: z.coerce.number().int().default(0),
});

export type PriceRuleFormData = z.infer<typeof PriceRuleSchema>;

export class CreatePriceRuleDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  baseField?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  valueType?: string;

  @IsNumber()
  @IsOptional()
  minMargin?: number;

  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @IsNumber()
  @IsOptional()
  roundTo?: number;

  @IsString()
  @IsOptional()
  marketplace?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

export class UpdatePriceRuleDto extends CreatePriceRuleDto {}
