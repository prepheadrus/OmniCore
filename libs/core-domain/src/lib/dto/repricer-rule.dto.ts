import { z } from 'zod';

import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, Min } from 'class-validator';

export const RepricerRuleSchema = z.object({
  name: z.string().min(1, 'Kural adı zorunludur'),
  description: z.string().optional().default(''),
  marketplace: z.string().default('all'),
  strategy: z.enum(['match_lowest', 'beat_by', 'below_avg', 'win_buybox', 'custom']).default('match_lowest'),
  targetPosition: z.coerce.number().int().min(1).default(1),
  beatBy: z.coerce.number().min(0).default(0),
  beatByType: z.enum(['fixed', 'percentage']).default('fixed'),
  minPrice: z.coerce.number().min(0).default(0),
  maxPrice: z.coerce.number().min(0).default(0),
  costFloor: z.boolean().default(true),
  minMargin: z.coerce.number().min(0).default(0),
  maxMargin: z.coerce.number().min(0).default(0),
  rounding: z.enum(['none', 'up_99', 'nearest_50', 'nearest_10']).default('none'),
  schedule: z.string().default('always'),
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  priority: z.coerce.number().int().default(0),
});

export type RepricerRuleFormData = z.infer<typeof RepricerRuleSchema>;

export class CreateRepricerRuleDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  marketplace?: string;

  @IsString()
  @IsOptional()
  strategy?: string;

  @IsNumber()
  @IsOptional()
  targetPosition?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  beatBy?: number;

  @IsString()
  @IsOptional()
  beatByType?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsBoolean()
  @IsOptional()
  costFloor?: boolean;

  @IsNumber()
  @IsOptional()
  minMargin?: number;

  @IsNumber()
  @IsOptional()
  maxMargin?: number;

  @IsString()
  @IsOptional()
  rounding?: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;
}

export class UpdateRepricerRuleDto extends CreateRepricerRuleDto {}
