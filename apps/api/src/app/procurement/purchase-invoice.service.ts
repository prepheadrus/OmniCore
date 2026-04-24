import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreatePurchaseInvoiceDto, GetPurchaseInvoicesFilterDto, PurchaseInvoiceStatusDto } from '@omnicore/core-domain/dto';

@Injectable()
export class PurchaseInvoiceService {
  constructor(
    private readonly db: DatabaseService
  ) {}

  async create(createDto: CreatePurchaseInvoiceDto) {
    const { items, status, ...invoiceData } = createDto;

    return this.db.client.purchaseInvoice.create({
      data: {
        ...invoiceData,
        status: status === PurchaseInvoiceStatusDto.COMPLETED ? 'COMPLETED' : 'DRAFT',
        items: {
          create: items.map((item: any) => ({
            ...item
          }))
        }
      },
      include: {
        items: true,
        supplier: true
      }
    });
  }

  async findMany(filterDto: GetPurchaseInvoicesFilterDto) {
    const { page = 1, limit = 10, supplierId, documentNo, status } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (documentNo) {
      where.documentNo = {
        contains: documentNo,
        mode: 'insensitive'
      };
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.db.client.purchaseInvoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.db.client.purchaseInvoice.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const invoice = await this.db.client.purchaseInvoice.findFirst({
      where: { id },
      include: {
        items: true,
        supplier: true
      }
    });

    if (!invoice) {
      throw new NotFoundException(`Purchase invoice with id ${id} not found`);
    }

    return invoice;
  }
}
