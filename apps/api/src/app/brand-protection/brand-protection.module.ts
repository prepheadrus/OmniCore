import { Module } from '@nestjs/common';
import { BrandProtectionController } from './brand-protection.controller';
import { BrandProtectionService } from './brand-protection.service';
import { DatabaseModule } from '@omnicore/database';

@Module({
  imports: [DatabaseModule],
  controllers: [BrandProtectionController],
  providers: [BrandProtectionService],
  exports: [BrandProtectionService],
})
export class BrandProtectionModule {}
