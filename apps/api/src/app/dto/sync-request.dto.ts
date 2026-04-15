import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SyncRequestDto {
  @ApiProperty({
    description: 'The ID of the tenant making the request',
    example: 'tenant-123',
  })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({
    description: 'The marketplace to sync (e.g., Trendyol, Amazon)',
    example: 'Trendyol',
  })
  @IsString()
  @IsOptional()
  marketplace?: string;

  @ApiProperty({
    description: 'The IDs of the sales channels to sync',
    example: ['trendyol-123', 'hepsiburada-456'],
    type: [String]
  })
  @IsString({ each: true })
  @IsNotEmpty()
  channelIds: string[];
}
