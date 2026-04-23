import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@omnicore/database';
import { CreatePurchaseInvoiceDto, CreatePurchaseInvoiceItemDto } from '@omnicore/core-domain';

@Injectable()
export class PurchaseInvoiceService {
  constructor(private readonly prismaService: DatabaseService) {}

  async create(createPurchaseInvoiceDto: CreatePurchaseInvoiceDto) {
    const { items, ...invoiceData } = createPurchaseInvoiceDto;
    const prisma = this.prismaService.client;

    const isCompleted = invoiceData.status === 'COMPLETED';

    // Fallback if channelId isn't provided but it is required by the Prisma type
    const safeChannelId = invoiceData.channelId || 'unknown';

    if (isCompleted) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return prisma.$transaction(async (tx: any) => {
        const invoice = await tx.purchaseInvoice.create({
          data: {
            ...invoiceData,
            channelId: safeChannelId,
            status: invoiceData.status,
            items: {
              create: items.map((item: CreatePurchaseInvoiceItemDto) => ({
                ...item,
              })),
            },
          },
          include: { items: true },
        });

        // Future logic for Moving Average Cost will be here

        return invoice;
      });
    }

    return prisma.purchaseInvoice.create({
      data: {
        ...invoiceData,
        channelId: safeChannelId,
        status: invoiceData.status as 'DRAFT' | 'MATCHING_PENDING' | 'COMPLETED',
        items: {
          create: items.map((item: CreatePurchaseInvoiceItemDto) => ({
            ...item,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const prisma = this.prismaService.client;

    const where = search
      ? {
          OR: [
            { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
            { supplier: { name: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.purchaseInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { supplier: true },
      }),
      prisma.purchaseInvoice.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const prisma = this.prismaService.client;
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        items: true,
        supplier: true
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Purchase invoice with ID ${id} not found`);
    }

    return invoice;
  }
}
