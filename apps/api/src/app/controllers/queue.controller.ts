import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoreQueueService, JobTypes } from '@omnicore/queue-management';
import { SyncRequestDto } from '../dto/sync-request.dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Queue Management')
@Controller('sync')
export class QueueController {
  constructor(private readonly queueService: CoreQueueService) {}

  @Post('orders')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger order synchronization manually' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Order sync job created',
  })
  async syncOrders(@Body() syncRequestDto: SyncRequestDto) {
    const jobId = uuidv4();
    await this.queueService.addSyncJob(JobTypes.FETCH_ORDERS, {
      tenantId: syncRequestDto.tenantId,
      marketplace: syncRequestDto.marketplace,
      channelId: syncRequestDto.channelId,
      type: JobTypes.FETCH_ORDERS,
    }, jobId);

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
    await this.queueService.addSyncJob(JobTypes.FETCH_PRODUCTS, {
      tenantId: syncRequestDto.tenantId,
      marketplace: syncRequestDto.marketplace,
      channelId: syncRequestDto.channelId,
      type: JobTypes.FETCH_PRODUCTS,
    }, jobId);

    return {
      message: 'Product synchronization job accepted',
      jobId,
    };
  }
}
