import { Controller, Get, Post, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { BrandProtectionService } from './brand-protection.service';

@Controller('brand-protection')
export class BrandProtectionController {
  constructor(private readonly brandProtectionService: BrandProtectionService) {}

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
  ) {
    return this.brandProtectionService.findAll({ type, severity, status });
  }

  @Post()
  async create(@Body() body: Record<string, any>) {
    // Normalize array fields to JSON strings if passed as objects
    const evidence =
      body.evidence !== undefined
        ? typeof body.evidence === 'string'
          ? body.evidence
          : JSON.stringify(body.evidence)
        : '[]';

    return this.brandProtectionService.create({
      type: body.type ?? 'map_violation',
      productId: body.productId ?? '',
      productName: body.productName ?? '',
      sku: body.sku ?? '',
      marketplace: body.marketplace ?? '',
      seller: body.seller ?? '',
      sellerUrl: body.sellerUrl ?? '',
      detectedPrice: body.detectedPrice ?? 0,
      mapPrice: body.mapPrice ?? 0,
      ourPrice: body.ourPrice ?? 0,
      violationAmount: body.violationAmount ?? 0,
      evidence,
      severity: body.severity ?? 'medium',
      status: body.status ?? 'detected',
      actionTaken: body.actionTaken ?? '',
      reportedAt: body.reportedAt ? new Date(body.reportedAt) : null,
      resolvedAt: body.resolvedAt ? new Date(body.resolvedAt) : null,
      notes: body.notes ?? '',
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Record<string, any>) {
    const updateData: any = { ...body };
    if (updateData.evidence !== undefined) {
      updateData.evidence =
        typeof updateData.evidence === 'string'
          ? updateData.evidence
          : JSON.stringify(updateData.evidence);
    }
    if (updateData.reportedAt !== undefined && updateData.reportedAt) {
      updateData.reportedAt = new Date(updateData.reportedAt as string);
    }
    if (updateData.resolvedAt !== undefined && updateData.resolvedAt) {
      updateData.resolvedAt = new Date(updateData.resolvedAt as string);
    }

    return this.brandProtectionService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.brandProtectionService.remove(id);
    return { success: true };
  }
}
