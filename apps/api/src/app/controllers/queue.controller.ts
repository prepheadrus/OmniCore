import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MarketplaceQueueService } from '@omnicore/queue-management';
import { SyncRequestDto } from '../dto/sync-request.dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Queue Management')
@Controller('sync')
export class QueueController {
  constructor(private readonly queueService: MarketplaceQueueService) {}

  @Post('orders')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger order synchronization manually' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Order sync job created',
  })
  async syncOrders(@Body() syncRequestDto: SyncRequestDto) {
    const jobId = uuidv4();
    await this.queueService.addSyncJob('sync-orders', {
      id: jobId,
      data: {
        tenantId: syncRequestDto.tenantId,
        marketplace: syncRequestDto.marketplace,
        type: 'order',
      },
    });

    return {
      message: 'Order synchronization job accepted',
      jobId,
    };
  }

  @Post('products')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger product synchronization manually' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Product sync job created',
  })
  async syncProducts(@Body() syncRequestDto: SyncRequestDto) {
    const jobId = uuidv4();
    await this.queueService.addSyncJob('sync-products', {
      id: jobId,
      data: {
        tenantId: syncRequestDto.tenantId,
        marketplace: syncRequestDto.marketplace,
        type: 'product',
      },
    });

    return {
      message: 'Product synchronization job accepted',
      jobId,
    };
  }
}
