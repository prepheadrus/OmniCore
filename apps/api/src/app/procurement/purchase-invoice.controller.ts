import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PurchaseInvoiceService } from './purchase-invoice.service';
import { CreatePurchaseInvoiceDto, GetPurchaseInvoicesFilterDto } from '@omnicore/core-domain/dto';

@Controller('procurement/invoices')
export class PurchaseInvoiceController {
  constructor(private readonly purchaseInvoiceService: PurchaseInvoiceService) {}

  @Post()
  async create(@Body() createDto: CreatePurchaseInvoiceDto) {
    return this.purchaseInvoiceService.create(createDto);
  }

  @Get()
  async findMany(@Query() filterDto: GetPurchaseInvoicesFilterDto) {
    return this.purchaseInvoiceService.findMany(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.purchaseInvoiceService.findOne(id);
  }
}
